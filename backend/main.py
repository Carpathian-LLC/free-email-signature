# ------------------------------------------------------------------------------------
# Developed by Carpathian, LLC - Open Source
# ------------------------------------------------------------------------------------
# Free Email Signature Generator - API Server
# ------------------------------------------------------------------------------------
# Notes:C
# - Images cached in memory after first access for sub-millisecond retrieval
# - All config read from keys.env at project root
# - MySQL optional. App runs without it, photo upload is just disabled.
# ------------------------------------------------------------------------------------

import hashlib
import io
import logging
import os
import secrets
import struct
import time
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / "keys.env")

from fastapi import FastAPI, File, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response


# ------------------------------------------------------------------------------------
# Logging
# ------------------------------------------------------------------------------------
# Three log files, each rotates at 5MB and keeps 5 backups:
#   logs/app.log      - general application events (startup, uploads, requests)
#   logs/security.log - security events (rate limits, rejected files, traversal attempts)
#   logs/error.log    - errors only, from both loggers
# Nothing prints to stdout. Check the log files.
# ------------------------------------------------------------------------------------

from logging.handlers import RotatingFileHandler

LOG_DIR = Path(__file__).parent / "logs"
LOG_DIR.mkdir(exist_ok=True)

LOG_FORMAT = "%(asctime)s  %(levelname)-8s  %(name)s  %(message)s"
LOG_DATE = "%Y-%m-%d %H:%M:%S"
LOG_MAX_BYTES = 5 * 1024 * 1024
LOG_BACKUP_COUNT = 5

# Kill the root logger's default stderr handler so nothing goes to terminal
logging.root.handlers = []
logging.root.setLevel(logging.INFO)

# Also silence uvicorn's access and error loggers from printing to terminal
for uv_name in ("uvicorn", "uvicorn.access", "uvicorn.error"):
    uv_logger = logging.getLogger(uv_name)
    uv_logger.handlers = []
    uv_logger.propagate = False

def _make_handler(filename: str, level: int = logging.INFO) -> RotatingFileHandler:
    handler = RotatingFileHandler(
        LOG_DIR / filename, maxBytes=LOG_MAX_BYTES, backupCount=LOG_BACKUP_COUNT,
    )
    handler.setLevel(level)
    handler.setFormatter(logging.Formatter(LOG_FORMAT, datefmt=LOG_DATE))
    return handler

app_logger = logging.getLogger("app")
app_logger.setLevel(logging.INFO)
app_logger.addHandler(_make_handler("app.log"))

security_logger = logging.getLogger("security")
security_logger.setLevel(logging.INFO)
security_logger.addHandler(_make_handler("security.log"))

error_handler = _make_handler("error.log", logging.ERROR)
app_logger.addHandler(error_handler)
security_logger.addHandler(error_handler)

# Route uvicorn's logs into app.log too so startup messages are captured
uv_app_handler = _make_handler("app.log")
for uv_name in ("uvicorn", "uvicorn.access", "uvicorn.error"):
    uv_logger = logging.getLogger(uv_name)
    uv_logger.addHandler(uv_app_handler)


# ------------------------------------------------------------------------------------
# Config (all from keys.env)
# ------------------------------------------------------------------------------------

UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR", str(Path(__file__).parent / "uploads")))
UPLOAD_DIR.mkdir(exist_ok=True, mode=0o700)

COS_SALT = os.environ.get("COS_SALT", "").strip()
if not COS_SALT:
    raise ValueError("COS_SALT must be set in keys.env. Generate one with: python3 -c \"import secrets; print(secrets.token_hex(32))\"")

MAX_UPLOAD_BYTES = int(os.environ.get("MAX_UPLOAD_BYTES", str(2 * 1024 * 1024)))
MAX_IMAGE_DIMENSION = int(os.environ.get("MAX_IMAGE_DIMENSION", "2000"))
RATE_LIMIT_WINDOW = int(os.environ.get("RATE_LIMIT_WINDOW", "60"))
RATE_LIMIT_MAX = int(os.environ.get("RATE_LIMIT_MAX", "5"))
MIN_UPLOAD_TIME_MS = int(os.environ.get("MIN_UPLOAD_TIME_MS", "2000"))
IMAGE_CACHE_MAX_BYTES = int(os.environ.get("IMAGE_CACHE_MAX_BYTES", str(256 * 1024 * 1024)))
MAX_TRACKED_IPS = int(os.environ.get("MAX_TRACKED_IPS", "10000"))
MAX_PAGE_TOKENS = int(os.environ.get("MAX_PAGE_TOKENS", "10000"))

ALLOWED_ORIGINS = [
    o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "").split(",")
    if o.strip() and o.strip() != "*"
]
if not ALLOWED_ORIGINS:
    raise ValueError("ALLOWED_ORIGINS must be set in keys.env")

# First 8 bytes of a file tell us what it actually is, regardless of what the
# Content-Type header claims. We only accept real image formats.
IMAGE_SIGNATURES = {
    b"\xff\xd8\xff": "image/jpeg",
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"GIF87a": "image/gif",
    b"GIF89a": "image/gif",
    b"RIFF": "image/webp",
}

TRUST_PROXY = os.environ.get("TRUST_PROXY", "").lower() in ("1", "true", "yes")

HONEYPOT_RESPONSE = {"success": True, "url": "/cos/a1b2c3d4e5f6/9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8"}

_upload_timestamps: dict[str, list[float]] = {}
_page_tokens: dict[str, float] = {}

# LRU image cache with byte-budget cap. Oldest entries evicted when budget exceeded.
# Keys are insertion-ordered (Python 3.7+), so we evict from the front.
_image_cache: dict[str, tuple[bytes, str]] = {}
_image_cache_bytes: int = 0
_type_map: dict[str, str] = {}


def _cache_image(key: str, data: bytes, content_type: str) -> None:
    """Add an image to the in-memory cache, evicting oldest entries if over budget."""
    global _image_cache_bytes
    if key in _image_cache:
        return
    entry_size = len(data)
    while _image_cache and _image_cache_bytes + entry_size > IMAGE_CACHE_MAX_BYTES:
        evict_key, (evict_data, _) = next(iter(_image_cache.items()))
        _image_cache_bytes -= len(evict_data)
        del _image_cache[evict_key]
    _image_cache[key] = (data, content_type)
    _image_cache_bytes += entry_size


# ------------------------------------------------------------------------------------
# Database
# ------------------------------------------------------------------------------------

db_pool = None


def _init_db():
    """Connect to MySQL using credentials from keys.env. TLS enabled when certs provided."""
    global db_pool
    try:
        import mysql.connector.pooling

        ssl_config = {}
        ssl_ca = os.environ.get("DB_SSL_CA")
        ssl_cert = os.environ.get("DB_SSL_CERT")
        ssl_key = os.environ.get("DB_SSL_KEY")

        if ssl_ca:
            ssl_config["ssl_ca"] = ssl_ca
        if ssl_cert:
            ssl_config["ssl_cert"] = ssl_cert
        if ssl_key:
            ssl_config["ssl_key"] = ssl_key
        if not ssl_config and os.environ.get("DB_SSL", "true").lower() == "true":
            ssl_config["ssl_disabled"] = False

        db_pool = mysql.connector.pooling.MySQLConnectionPool(
            pool_name="cos_pool",
            pool_size=int(os.environ.get("DB_POOL_SIZE", "5")),
            host=os.environ.get("DB_HOST"),
            port=int(os.environ.get("DB_PORT", "3306")),
            user=os.environ.get("DB_USER"),
            password=os.environ.get("DB_PASS"),
            database=os.environ.get("DB_NAME"),
            **ssl_config,
        )
        app_logger.info("MySQL pool ready (TLS: %s)", bool(ssl_config))
    except Exception as e:
        app_logger.warning("MySQL unavailable: %s. Photo upload disabled.", e)


_init_db()


# ------------------------------------------------------------------------------------
# App
# ------------------------------------------------------------------------------------

app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
    max_age=86400,
)


@app.middleware("http")
async def request_pipeline(request: Request, call_next):
    """Log every request with timing, attach security headers to every response."""
    start = time.perf_counter()
    client_ip = _get_client_ip(request)

    response = await call_next(request)

    elapsed_ms = (time.perf_counter() - start) * 1000
    app_logger.info(
        "%s %s %d %.2fms %s",
        request.method, request.url.path, response.status_code, elapsed_ms, client_ip,
    )

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms https://*.highperformanceformat.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https:; "
        "connect-src 'self' https://www.google-analytics.com https://www.clarity.ms; "
        "frame-src 'self' https://*.highperformanceformat.com"
    )

    return response


@app.on_event("startup")
async def on_startup():
    """Pre-warm the type map so image retrieval never touches the DB."""
    app_logger.info("Server started on port %s", os.environ.get("BACKEND_PORT", "?"))
    if db_pool:
        conn = None
        try:
            conn = db_pool.get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT random_hash, asset_hash, content_type FROM images")
            for rh, ah, ct in cursor.fetchall():
                _type_map[f"{rh}/{ah}"] = ct
            cursor.close()
            app_logger.info("Preloaded %d image type mappings", len(_type_map))
        except Exception as e:
            app_logger.warning("Type map preload failed: %s", e)
        finally:
            if conn:
                try:
                    conn.close()
                except Exception:
                    pass


@app.on_event("shutdown")
async def on_shutdown():
    app_logger.info("Server shutting down")


@app.exception_handler(Exception)
async def catch_all(request: Request, exc: Exception):
    """Log the real error, return a generic message so nothing leaks to the client."""
    security_logger.error(
        "Unhandled %s on %s %s: %s",
        type(exc).__name__, request.method, request.url.path, exc,
    )
    return JSONResponse(status_code=500, content={"error": "Internal server error"})


# ------------------------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------------------------


def _validate_magic_bytes(content: bytes) -> str | None:
    """Check the first bytes of a file against known image signatures.
    Returns the real MIME type or None if the file isn't a supported image."""
    for magic, mime in IMAGE_SIGNATURES.items():
        if content[: len(magic)] == magic:
            if mime == "image/webp" and b"WEBP" not in content[8:12]:
                continue
            return mime
    return None


def _check_rate_limit(ip: str) -> bool:
    """Sliding window rate limiter. Returns False if the IP exceeded the limit."""
    now = time.time()

    # Periodic global prune: remove IPs with fully-expired windows
    if len(_upload_timestamps) > MAX_TRACKED_IPS:
        stale_ips = [k for k, v in _upload_timestamps.items() if not v or now - v[-1] > RATE_LIMIT_WINDOW]
        for k in stale_ips:
            del _upload_timestamps[k]

    window = _upload_timestamps.get(ip, [])
    window = [t for t in window if now - t < RATE_LIMIT_WINDOW]
    if len(window) >= RATE_LIMIT_MAX:
        _upload_timestamps[ip] = window
        return False
    window.append(now)
    _upload_timestamps[ip] = window
    return True


def _generate_hashes(content: bytes, filename: str) -> tuple[str, str]:
    """Generate the two-part COS path. The random_hash is a namespace, the asset_hash
    is derived from the file content + salt so the same file uploaded twice gets
    different URLs (intentional for privacy)."""
    random_hash = secrets.token_hex(6)
    raw = f"{random_hash}:{filename}:{len(content)}:{COS_SALT}:{time.time_ns()}"
    asset_hash = hashlib.sha256(raw.encode() + content).hexdigest()
    return random_hash, asset_hash


def _get_client_ip(request: Request) -> str:
    """Extract client IP, only trusting X-Forwarded-For when behind a known proxy."""
    if TRUST_PROXY:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _check_origin(request: Request) -> bool:
    """Verify the Origin header on mutating requests matches allowed origins.
    POST requests without an Origin header are rejected."""
    origin = request.headers.get("origin")
    if not origin:
        referer = request.headers.get("referer")
        if request.method == "POST":
            if not referer:
                return False
            return any(referer.startswith(o) for o in ALLOWED_ORIGINS)
        return True
    return origin in ALLOWED_ORIGINS


def _get_image_dimensions(content: bytes, mime: str) -> tuple[int, int] | None:
    """Read image dimensions from raw bytes without decoding the full image."""
    try:
        if mime == "image/png":
            if len(content) >= 24:
                w, h = struct.unpack(">II", content[16:24])
                return w, h
        elif mime == "image/jpeg":
            f = io.BytesIO(content)
            f.read(2)
            for _ in range(256):
                marker = f.read(2)
                if len(marker) < 2:
                    break
                if marker[0] != 0xFF:
                    break
                if marker[1] in (0xC0, 0xC1, 0xC2):
                    f.read(3)
                    h, w = struct.unpack(">HH", f.read(4))
                    return w, h
                size_data = f.read(2)
                if len(size_data) < 2:
                    break
                size = struct.unpack(">H", size_data)[0]
                if size < 2:
                    break
                f.read(size - 2)
        elif mime == "image/gif":
            if len(content) >= 10:
                w, h = struct.unpack("<HH", content[6:10])
                return w, h
        elif mime == "image/webp":
            if len(content) >= 30 and content[12:16] == b"VP8 ":
                w = (content[26] | (content[27] << 8)) & 0x3FFF
                h = (content[28] | (content[29] << 8)) & 0x3FFF
                return w, h
    except Exception:
        pass
    return None


def _is_bot_request(request: Request) -> bool:
    """Stack lightweight signals to detect non-browser requests."""
    sec_fetch = request.headers.get("sec-fetch-site")
    if sec_fetch and sec_fetch not in ("same-origin", "same-site"):
        return True
    if not request.headers.get("accept-language"):
        return True
    if not request.headers.get("accept"):
        return True
    return False


def _is_safe_hex(segment: str) -> bool:
    """Only allow lowercase hex characters in URL path segments. Blocks any
    directory traversal attempts like ../ or %2e%2e."""
    return bool(segment) and all(c in "0123456789abcdef" for c in segment)


# ------------------------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------------------------


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/upload-token")
def upload_token(request: Request):
    """Issue a short-lived token so the upload endpoint can check timing."""
    # Clean old tokens first (older than 10 minutes)
    cutoff = time.time() - 600
    stale = [k for k, v in _page_tokens.items() if v < cutoff]
    for k in stale:
        del _page_tokens[k]

    # Cap total tokens to prevent memory exhaustion
    if len(_page_tokens) >= MAX_PAGE_TOKENS:
        return JSONResponse(status_code=429, content={"error": "Please try again later."})

    # Rate limit token requests per IP (reuse upload rate limiter)
    client_ip = _get_client_ip(request)
    if not _check_rate_limit(client_ip):
        return JSONResponse(status_code=429, content={"error": "Please try again later."})

    token = secrets.token_hex(16)
    _page_tokens[token] = time.time()
    return {"token": token}


@app.post("/api/upload")
async def upload_image(request: Request, file: UploadFile = File(...)):
    if not db_pool:
        return JSONResponse(status_code=503, content={"error": "Photo upload is temporarily unavailable."})

    if not _check_origin(request):
        security_logger.warning("CSRF origin mismatch on upload: %s", request.headers.get("origin"))
        return JSONResponse(status_code=403, content={"error": "Forbidden"})

    client_ip = _get_client_ip(request)

    # ── Honeypot: if the hidden field is set, silent drop ────────
    form = await request.form()
    if form.get("website_url"):
        security_logger.info("Honeypot triggered from %s", client_ip)
        return JSONResponse(content=HONEYPOT_RESPONSE)

    # ── Bot detection: missing browser headers, silent drop ──────
    if _is_bot_request(request):
        security_logger.info("Bot-like request dropped from %s", client_ip)
        return JSONResponse(content=HONEYPOT_RESPONSE)

    # ── Token validation: required, prevents direct API abuse ───
    upload_token_value = form.get("upload_token")
    if not upload_token_value or not isinstance(upload_token_value, str):
        security_logger.info("Missing upload token from %s", client_ip)
        return JSONResponse(content=HONEYPOT_RESPONSE)

    issued_at = _page_tokens.pop(upload_token_value, None)
    if not issued_at:
        security_logger.info("Invalid upload token from %s", client_ip)
        return JSONResponse(content=HONEYPOT_RESPONSE)

    if (time.time() - issued_at) * 1000 < MIN_UPLOAD_TIME_MS:
        security_logger.info("Upload too fast from %s (%.0fms)", client_ip, (time.time() - issued_at) * 1000)
        return JSONResponse(content=HONEYPOT_RESPONSE)

    if not _check_rate_limit(client_ip):
        security_logger.warning("Rate limit exceeded: %s", client_ip)
        return JSONResponse(
            status_code=429,
            content={"error": "Too many uploads. Try again in a minute."},
        )

    content = await file.read()

    if len(content) > MAX_UPLOAD_BYTES:
        return JSONResponse(status_code=413, content={"error": f"File too large. Maximum is {MAX_UPLOAD_BYTES // (1024 * 1024)}MB."})

    if len(content) < 8:
        return JSONResponse(status_code=400, content={"error": "File too small"})

    detected_type = _validate_magic_bytes(content)
    if not detected_type:
        security_logger.warning("Rejected non-image upload from %s", client_ip)
        return JSONResponse(
            status_code=400,
            content={"error": "Not a supported image. Use JPEG, PNG, GIF, or WebP."},
        )

    # ── Dimension check ─────────────────────────────────────────
    dims = _get_image_dimensions(content, detected_type)
    if dims:
        w, h = dims
        if w > MAX_IMAGE_DIMENSION or h > MAX_IMAGE_DIMENSION:
            return JSONResponse(
                status_code=400,
                content={"error": f"Image too large. Maximum dimensions are {MAX_IMAGE_DIMENSION}x{MAX_IMAGE_DIMENSION}px."},
            )

    random_hash, asset_hash = _generate_hashes(content, file.filename or "upload")

    dir_path = UPLOAD_DIR / random_hash
    dir_path.mkdir(exist_ok=True, mode=0o700)
    file_path = dir_path / asset_hash
    file_path.write_bytes(content)
    file_path.chmod(0o600)

    key = f"{random_hash}/{asset_hash}"
    conn = None
    try:
        conn = db_pool.get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO images (random_hash, asset_hash, content_type, file_size, original_name, uploader_ip) "
            "VALUES (%s, %s, %s, %s, %s, %s)",
            (random_hash, asset_hash, detected_type, len(content), (file.filename or "upload")[:255], client_ip),
        )
        conn.commit()
        cursor.close()
        _cache_image(key, content, detected_type)
        _type_map[key] = detected_type
    except Exception as e:
        security_logger.error("DB write failed for image %s/%s: %s", random_hash, asset_hash, e)
        # Clean up orphaned file on DB failure
        try:
            file_path.unlink(missing_ok=True)
            if dir_path.exists() and not any(dir_path.iterdir()):
                dir_path.rmdir()
        except OSError:
            pass
        return JSONResponse(status_code=500, content={"error": "Upload failed. Please try again later."})
    finally:
        if conn:
            try:
                conn.close()
            except Exception:
                pass

    app_logger.info("Upload %s %d bytes %s from %s", key, len(content), detected_type, client_ip)
    return {"success": True, "url": f"/cos/{random_hash}/{asset_hash}"}


@app.get("/cos/{random_hash}/{asset_hash}")
async def get_image(random_hash: str, asset_hash: str, request: Request):
    if not _is_safe_hex(random_hash) or not _is_safe_hex(asset_hash):
        security_logger.warning("Bad COS path: %s/%s", random_hash, asset_hash)
        return JSONResponse(status_code=400, content={"error": "Invalid path"})

    # Enforce expected lengths: random_hash=12 hex chars, asset_hash=64 hex chars
    if len(random_hash) != 12 or len(asset_hash) != 64:
        security_logger.warning("Bad COS path length: %d/%d", len(random_hash), len(asset_hash))
        return JSONResponse(status_code=400, content={"error": "Invalid path"})

    key = f"{random_hash}/{asset_hash}"
    etag = f'"{asset_hash}"'

    if request.headers.get("if-none-match") == etag:
        return Response(status_code=304)

    ct_for_ext = {"image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/webp": "webp"}

    cached = _image_cache.get(key)
    if cached:
        ext = ct_for_ext.get(cached[1], "bin")
        headers = {
            "Cache-Control": "public, max-age=31536000, immutable",
            "ETag": etag,
            "X-Content-Type-Options": "nosniff",
            "Content-Disposition": f'inline; filename="image.{ext}"',
        }
        return Response(content=cached[0], media_type=cached[1], headers=headers)

    file_path = UPLOAD_DIR / random_hash / asset_hash
    try:
        resolved = file_path.resolve()
        if not str(resolved).startswith(str(UPLOAD_DIR.resolve())):
            security_logger.error("Path traversal blocked: %s -> %s", file_path, resolved)
            return JSONResponse(status_code=403, content={"error": "Forbidden"})
        data = resolved.read_bytes()
    except (FileNotFoundError, PermissionError):
        return JSONResponse(status_code=404, content={"error": "Not found"})
    ct = _type_map.get(key, "image/png")
    _cache_image(key, data, ct)

    ext = ct_for_ext.get(ct, "bin")
    headers = {
        "Cache-Control": "public, max-age=31536000, immutable",
        "ETag": etag,
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": f'inline; filename="image.{ext}"',
    }
    return Response(content=data, media_type=ct, headers=headers)
