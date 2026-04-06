# ------------------------------------------------------------------------------------
# Developed by Carpathian, LLC - Open Source
# ------------------------------------------------------------------------------------
# Free Email Signature Generator - Dev Autostart (macOS only)
# ------------------------------------------------------------------------------------
# Notes:
# - Kills stale processes on configured ports, then starts services in Terminal tabs
# - Reads ports from keys.env so nothing is hardcoded here
# - Toggle services via SERVICE_CONFIG enabled flags below
# ------------------------------------------------------------------------------------

import os
import subprocess
import shlex
import platform
import signal
import time
from pathlib import Path


# ------------------------------------------------------------------------------------
# Load config from keys.env
# ------------------------------------------------------------------------------------

ROOT_DIR = Path(__file__).resolve().parent
KEYS_ENV = ROOT_DIR / "keys.env"

env_vars: dict[str, str] = {}
if KEYS_ENV.exists():
    for line in KEYS_ENV.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" in line:
            k, v = line.split("=", 1)
            env_vars[k.strip()] = v.strip()

BACKEND_PORT = int(env_vars.get("BACKEND_PORT", "5001"))
FRONTEND_PORT = int(env_vars.get("FRONTEND_PORT", "5000"))


# ------------------------------------------------------------------------------------
# Service Configuration
# ------------------------------------------------------------------------------------

SERVICE_CONFIG = {
    "backend": {
        "label": "BACKEND",
        "port": BACKEND_PORT,
        "enabled": True,
        "cwd": "backend",
        "type": "backend",
    },
    "frontend": {
        "label": "FRONTEND",
        "port": FRONTEND_PORT,
        "enabled": True,
        "cwd": "frontend",
        "type": "frontend",
    },
}

ALL_KNOWN_PORTS = [svc["port"] for svc in SERVICE_CONFIG.values()]


# ------------------------------------------------------------------------------------
# Process Management
# ------------------------------------------------------------------------------------


def find_pids_on_port(port: int) -> list[int]:
    try:
        result = subprocess.run(
            ["lsof", "-ti", f":{port}"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        if result.returncode == 0 and result.stdout.strip():
            return [
                int(pid)
                for pid in result.stdout.strip().split("\n")
                if pid.strip()
            ]
    except (subprocess.TimeoutExpired, ValueError):
        pass
    return []


def kill_processes_on_ports(ports: list[int]) -> None:
    killed_any = False
    for port in ports:
        pids = find_pids_on_port(port)
        for pid in pids:
            try:
                os.kill(pid, signal.SIGTERM)
                killed_any = True
                print(f"  Killed PID {pid} on port {port}")
            except ProcessLookupError:
                pass
            except PermissionError:
                print(
                    f"  WARNING: Cannot kill PID {pid} on port {port} (permission denied)"
                )
    if killed_any:
        time.sleep(1)
    else:
        print("  No existing processes found.")


# ------------------------------------------------------------------------------------
# Terminal Launching (macOS)
# ------------------------------------------------------------------------------------


def mac_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')


def open_terminal_mac(cwd: Path, command: str) -> None:
    full_cmd = f"cd {shlex.quote(str(cwd))} && {command}"
    osa = (
        'tell application "Terminal"\n'
        "    activate\n"
        f'    do script "{mac_escape(full_cmd)}"\n'
        "end tell"
    )
    subprocess.run(["osascript", "-e", osa], check=True)


# ------------------------------------------------------------------------------------
# Database Setup
# ------------------------------------------------------------------------------------


def setup_database() -> None:
    """Create the database and tables if they don't exist. Reads config from keys.env."""
    db_host = env_vars.get("DB_HOST", "localhost")
    db_port = int(env_vars.get("DB_PORT", "3306"))
    db_user = env_vars.get("DB_USER", "root")
    db_pass = env_vars.get("DB_PASS", "")
    db_name = env_vars.get("DB_NAME", "db_emailgen")

    if not db_user:
        print("  DB_USER not set in keys.env, skipping database setup.")
        return

    try:
        import mysql.connector
    except ImportError:
        print("  mysql-connector-python not installed, skipping database setup.")
        return

    import re
    if not re.match(r'^[a-zA-Z0-9_]+$', db_name):
        print(f"  Invalid DB_NAME '{db_name}'. Only alphanumeric and underscores allowed.")
        return

    conn = None
    try:
        conn = mysql.connector.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            password=db_pass,
        )
        cursor = conn.cursor()

        cursor.execute(
            f"CREATE DATABASE IF NOT EXISTS `{db_name}` "
            f"DEFAULT CHARACTER SET utf8mb4 "
            f"DEFAULT COLLATE utf8mb4_unicode_ci"
        )
        cursor.execute(f"USE `{db_name}`")

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS images (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                random_hash VARCHAR(12) NOT NULL,
                asset_hash VARCHAR(64) NOT NULL,
                content_type VARCHAR(50) NOT NULL DEFAULT 'image/png',
                file_size INT UNSIGNED NOT NULL DEFAULT 0,
                original_name VARCHAR(255) DEFAULT NULL,
                uploader_ip VARCHAR(45) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY idx_cos (random_hash, asset_hash),
                INDEX idx_created (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)

        conn.commit()
        cursor.close()
        print(f"  Database '{db_name}' ready.")
    except Exception as e:
        print(f"  Database setup skipped: {e}")
    finally:
        if conn:
            try:
                conn.close()
            except Exception:
                pass


def build_start_command(svc: dict) -> str:
    port = svc["port"]
    header = (
        f"echo '=======================================' && "
        f"echo '{svc['label']} (PORT {port})' && "
        f"echo '=======================================' && "
        f"echo '' && "
    )
    if svc["type"] == "backend":
        return header + (
            f"source .venv/bin/activate && "
            f"python -m uvicorn main:app --reload --host 127.0.0.1 --port {port}"
        )
    return header + "npm run dev"


def start_services(root: Path) -> None:
    enabled = {k: v for k, v in SERVICE_CONFIG.items() if v["enabled"]}
    if not enabled:
        print("No services enabled. Edit SERVICE_CONFIG to enable services.")
        return

    missing = []
    for key, svc in enabled.items():
        svc_path = root / svc["cwd"]
        if not svc_path.exists():
            missing.append(str(svc_path))
    if missing:
        print("Missing required paths:")
        for m in missing:
            print(f"  - {m}")
        raise SystemExit(1)

    backends = {k: v for k, v in enabled.items() if v["type"] == "backend"}
    frontends = {k: v for k, v in enabled.items() if v["type"] == "frontend"}

    if backends:
        print("Starting backends...")
        for key, svc in backends.items():
            cmd = build_start_command(svc)
            open_terminal_mac(root / svc["cwd"], cmd)
            print(f"  {svc['label']} on port {svc['port']}")

    if frontends:
        print("\nStarting frontends...")
        for key, svc in frontends.items():
            cmd = build_start_command(svc)
            open_terminal_mac(root / svc["cwd"], cmd)
            print(f"  {svc['label']} on port {svc['port']}")


# ------------------------------------------------------------------------------------
# Entrypoint
# ------------------------------------------------------------------------------------

if __name__ == "__main__":
    if platform.system() != "Darwin":
        print("This autostart script only supports macOS.")
        raise SystemExit(1)

    print()
    print("=" * 60)
    print("FREE EMAIL SIGNATURE GENERATOR - DEV AUTOSTART")
    print("=" * 60)
    print()

    print("Cleaning up existing processes...")
    kill_processes_on_ports(ALL_KNOWN_PORTS)
    print()

    print("Setting up database...")
    setup_database()
    print()

    start_services(ROOT_DIR)
    print()
    print("All services started.")
    print()
