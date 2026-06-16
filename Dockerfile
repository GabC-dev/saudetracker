FROM haskell:9.6.7

# Adiciona repositório do PostgreSQL 16
RUN apt-get update && apt-get install -y curl gnupg && \
    curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /usr/share/keyrings/postgresql.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/postgresql.gpg] http://apt.postgresql.org/pub/repos/apt bookworm-pgdg main" > /etc/apt/sources.list.d/pgdg.list && \
    apt-get update && apt-get install -y \
    libpq-dev \
    postgresql-client-16 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY saudetracker.cabal ./
COPY cabal.project* ./

RUN cabal update && cabal build --only-dependencies

COPY . .

RUN cabal build

EXPOSE 8080

CMD ["cabal", "run"]