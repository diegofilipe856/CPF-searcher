FROM python:3.12-slim

# Instala dependências do sistema
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Instala o uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Copia os arquivos de dependência
COPY pyproject.toml uv.lock ./

# Instala as dependências
RUN uv sync --frozen

# Copia o resto do código
COPY . .

# Expõe a porta 8000
EXPOSE 8000

# Comando para iniciar o servidor
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
