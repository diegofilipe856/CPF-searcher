Esse projeto tem como objetivo aplicar conhecimentos adquiridos em Python e FastAPI. Essa API consulta um banco de dados local de pessoas e CPFs fictícios e retorna informações sobre essas pessoas

Para iniciar localmente, rode:
uv run uvicorn app.main:app --reload

## Frontend

O frontend React fica em `frontend/` e consome a API em `http://localhost:8000` por padrão.

```bash
cd frontend
npm install
npm run dev
```

Se a API estiver em outra porta ou host, crie um arquivo `.env` dentro de `frontend/`:

```bash
VITE_API_URL=http://localhost:8000
```
