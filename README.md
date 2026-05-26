This project applies Python and FastAPI concepts. The API queries a local database with fictitious people and CPF records, then returns information about those people.

To start locally, run:
uv run uvicorn app.main:app --reload

## Frontend

The React frontend is in `frontend/` and consumes the API at `http://localhost:8000` by default.

```bash
cd frontend
npm install
npm run dev
```

If the API runs on another port or host, create a `.env` file inside `frontend/`:

```bash
VITE_API_URL=http://localhost:8000
```
