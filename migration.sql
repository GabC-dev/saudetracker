-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id          SERIAL PRIMARY KEY,
    nome        VARCHAR(100) NOT NULL,
    idade       INT NOT NULL,
    altura      DOUBLE PRECISION NOT NULL,
    email       VARCHAR(100) UNIQUE NOT NULL,
    criado_em   TIMESTAMP DEFAULT NOW()
);

-- Tabela de métricas
CREATE TABLE IF NOT EXISTS metricas (
    id          SERIAL PRIMARY KEY,
    usuario_id  INT NOT NULL REFERENCES usuarios(id),
    tipo        VARCHAR(50) NOT NULL,
    valor1      DOUBLE PRECISION NOT NULL,
    valor2      DOUBLE PRECISION,
    registrado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de alertas
CREATE TABLE IF NOT EXISTS alertas (
    id          SERIAL PRIMARY KEY,
    usuario_id  INT NOT NULL REFERENCES usuarios(id),
    mensagem    TEXT NOT NULL,
    gerado_em   TIMESTAMP DEFAULT NOW()
);