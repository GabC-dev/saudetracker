FROM debian:bookworm-slim

# Instala dependências
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    build-essential \
    libgmp-dev \
    libffi-dev \
    libncurses-dev \
    libpq-dev \
    postgresql-client \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Instala GHCup
RUN curl --proto '=https' --tlsv1.2 -sSf https://get-ghcup.haskell.org | \
    BOOTSTRAP_HASKELL_NONINTERACTIVE=1 \
    BOOTSTRAP_HASKELL_GHC_VERSION=9.6.7 \
    BOOTSTRAP_HASKELL_CABAL_VERSION=latest \
    BOOTSTRAP_HASKELL_INSTALL_NO_STACK=1 \
    sh

ENV PATH="/root/.ghcup/bin:/root/.cabal/bin:$PATH"

WORKDIR /app

COPY saudetracker.cabal ./
COPY cabal.project* ./

RUN cabal update && cabal build --only-dependencies

COPY . .

RUN cabal build

EXPOSE 8080

CMD ["cabal", "run"]