# Sentrynx — Domain Verdict

Sentrynx scans a domain's website, email, ownership, and threat-intelligence signals, then produces a scored security report.

## Run locally

1. Create a `.env` file from `.env.example` and add your API keys.
2. Start the API:

   ```powershell
   .\venv\Scripts\Activate.ps1
   pip install -r backend\requirements.txt
   cd backend
   uvicorn app.main:app --reload
   ```

3. In a second terminal, start the web app:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

Open `http://localhost:5173`.

## Features

- Live scan progress with Server-Sent Events
- Scores across infrastructure, website, email, threat intelligence, and domain trust
- Private accounts and saved scan history
- SQLite persistence by default; PostgreSQL-ready configuration for production

## Docker API

After creating `.env`, run:

```powershell
docker compose up --build
```

The API will be available at `http://localhost:8000`. For production, set a strong `AUTH_SECRET_KEY`, use PostgreSQL, restrict CORS origins, and keep provider API keys only on the server.

## Tests

Install the development dependencies and run the backend tests:

```powershell
pip install -r backend\requirements-dev.txt
$env:PYTHONPATH = "$PWD\backend"
pytest backend\tests -q
```
