# osrs-trades

OSRS Grand Exchange price tracker. A FastAPI backend screens the OSRS Wiki pricing API for high-margin flips, and a Next.js frontend displays them with ROI, margin, 24h volume, EV score, and recommended buy price.

## Project structure

- `backend/` — FastAPI API (`api.py`), serves flip data from the OSRS Wiki pricing API.
- `frontend/` — Next.js app that displays the flip screener table.

## Prerequisites

- Python 3.10+
- Node.js 18+ and npm

## 1. Run the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```

The API will be available at `http://127.0.0.1:8000`:

- `GET /api/flips/roi?sort_by=roi` — flip candidates, sortable by `roi`, `margin`, `volume`, or `ev`. Optional filters: `min_margin`, `min_volume`, `min_roi`.
- `GET /api/flips/last-updated` — timestamp of the last price-cache refresh.

Price data is cached to `backend/prices.json` and refreshed every 5 minutes; the item mapping is cached to `backend/mapping.json`. Both files are gitignored.

## 2. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The frontend expects the backend at `http://127.0.0.1:8000`.

## Useful commands

```bash
# Frontend
cd frontend
npm run lint    # eslint
npm run build   # production build
npm start       # serve production build
```

