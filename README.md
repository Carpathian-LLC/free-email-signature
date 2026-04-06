# Free Email Signature Generator

Create professional email signatures without signing up, logging in, or paying. Pick a template, fill in your details, copy, paste into Gmail or Outlook. Done.

Built by [Carpathian](https://carpathian.ai). Open source under MIT.

## Quick Start (macOS)

```bash
# 1. Clone the repo
git clone https://github.com/Carpathian-LLC/free-email-signature.git
cd free-email-signature

# 2. Set up config
cp keys.env.example keys.env
# Edit keys.env with your values

# 3. Install dependencies
cd frontend && npm install && cd ..
cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && cd ..

# 4. Start everything
python3 autostart.py
```

`autostart.py` kills any stale processes on the configured ports, then opens two macOS Terminal windows: one for the backend (FastAPI on port 5001) and one for the frontend (Vite on port 5000). Close either window to stop that service.

## Manual Start

If you're not on macOS or prefer to run things manually:

```bash
# Terminal 1: Backend
cd backend
source .venv/bin/activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 5001

# Terminal 2: Frontend
cd frontend
npm run dev
```

## Configuration

All configuration lives in `keys.env` at the project root. See `keys.env.example` for the full list of available options.

The frontend reads `VITE_*` variables at build time. The backend reads everything else at startup via python-dotenv.

## Database (Optional)

Photo upload requires MySQL 8.0+. Without it, the app works fine but the upload button is disabled. Users can still paste image URLs manually.

```bash
mysql -u root < backend/schema.sql
```

The schema uses InnoDB tablespace encryption. See `backend/schema.sql` for setup instructions.

## Templates

Five signature styles included: Professional, Minimal, Modern, Bold, and Compact. All generate email-safe HTML (table-based layout, inline styles, Arial font) that works in Gmail, Outlook, Apple Mail, and Thunderbird.

## Security

- Images validated by magic bytes, not Content-Type header
- Upload rate limiting per IP
- All SQL queries parameterized
- Path traversal protection on image retrieval
- Security headers on every response (HSTS, X-Frame-Options, CSP, etc.)
- Database encryption at rest (InnoDB tablespace encryption)
- TLS for database connections when certs are provided

## License

MIT
