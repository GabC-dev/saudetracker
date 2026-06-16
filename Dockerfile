FROM haskell:9.6.7

# Instala dependências do PostgreSQL
RUN apt-get update && apt-get install -y \
    libpq-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia os arquivos de configuração
COPY saudetracker.cabal ./
COPY cabal.project* ./

# Baixa as dependências
RUN cabal update && cabal build --only-dependencies

# Copia o resto do código
COPY . .

# Compila o projeto
RUN cabal build

# Expõe a porta
EXPOSE 8080

# Roda o servidor
CMD ["cabal", "run"]