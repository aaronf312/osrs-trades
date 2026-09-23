# osrs-trades frontend

Next.js frontend for the OSRS Grand Exchange screener. It displays high-margin flips with ROI, margin, 24h volume, EV score, and recommended buy price.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The page fetches data from the FastAPI backend:

- `GET /api/flips/roi?sort_by=roi`
- `GET /api/flips/last-updated`

Make sure the backend is running on `http://127.0.0.1:8000`.

