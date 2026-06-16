FROM haskell:9.6.7-slim-bookworm

# Instala dependências do PostgreSQL 16
RUN apt-get update && apt-get install -y \
    libpq-dev \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY saudetracker.cabal ./
COPY cabal.project* ./

RUN cabal update && cabal build --only-dependencies

COPY . .

RUN cabal build

EXPOSE 8080

CMD ["cabal", "run"]