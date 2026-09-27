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

## Production URLs

- Frontend: https://diegobezerra.com.br/personal-projects/ssp-digital/
- Pages origin: https://ssp-digital-project.pages.dev/
- API: https://ssp-digital.diegobezerra.com.br

Vite uses relative asset paths so the same build works on Pages and under the
portfolio subpath. The Cloudflare Worker in `cloudflare/ssp-digital-proxy/`
forwards that subpath to Pages and redirects the entry URL to a trailing slash.
The API URL is unchanged; CORS allows the portfolio origin without its path.

The existing GitHub Actions workflow publishes the frontend on each push to
`main`. To update the proxy separately, authenticate with Wrangler and run:

```bash
npx wrangler@4 deploy --config cloudflare/ssp-digital-proxy/wrangler.jsonc
```

Deploying the proxy requires Workers Scripts and Workers Routes write access.
