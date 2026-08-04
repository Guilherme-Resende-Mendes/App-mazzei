-- Danilo Mazzei App — schema para import no DrawDB
-- Uso: drawdb.app → File → Import from SQL → PostgreSQL
-- Espelho estrutural de 001_schema.sql (sem enums/triggers/views/índices parciais)

-- Auth: owner → restaurante | client → candidato | admin → equipe
CREATE TABLE usuarios (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    papel VARCHAR(20) NOT NULL, -- owner | client | admin
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    ultimo_login_em TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE areas (
    id VARCHAR(20) PRIMARY KEY, -- cozinha | salao | bar
    nome VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE cargos (
    id UUID PRIMARY KEY,
    area_id VARCHAR(20) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    nivel INT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL,
    UNIQUE (area_id, nome),
    FOREIGN KEY (area_id) REFERENCES areas (id)
);

CREATE TABLE restaurantes (
    id UUID PRIMARY KEY,
    usuario_id UUID NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    cpf_cnpj VARCHAR(20) NOT NULL UNIQUE,
    endereco TEXT NOT NULL,
    telefone VARCHAR(30) NOT NULL,
    nivel_exigencia INT, -- 1..5 opcional MVP
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
);

CREATE TABLE candidatos (
    id UUID PRIMARY KEY,
    usuario_id UUID NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    documento VARCHAR(30) NOT NULL UNIQUE,
    endereco TEXT NOT NULL,
    telefone VARCHAR(30) NOT NULL,
    cargo_id UUID NOT NULL,
    pretensao_salarial DECIMAL(10, 2) NOT NULL,
    nota_geral DECIMAL(3, 2) NOT NULL DEFAULT 0,
    bio TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
    FOREIGN KEY (cargo_id) REFERENCES cargos (id)
);

CREATE TABLE candidato_selos (
    candidato_id UUID NOT NULL,
    selo VARCHAR(20) NOT NULL, -- pontual | flexivel
    concedido_em TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (candidato_id, selo),
    FOREIGN KEY (candidato_id) REFERENCES candidatos (id)
);

CREATE TABLE vagas (
    id UUID PRIMARY KEY,
    restaurante_id UUID NOT NULL,
    cargo_id UUID NOT NULL,
    data DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    qtd_pessoas INT NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'aberta', -- aberta | preenchida | cancelada
    observacao TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes (id),
    FOREIGN KEY (cargo_id) REFERENCES cargos (id)
);

CREATE TABLE contratacoes (
    id UUID PRIMARY KEY,
    vaga_id UUID NOT NULL,
    candidato_id UUID NOT NULL,
    restaurante_id UUID NOT NULL,
    preco_acordado DECIMAL(10, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'solicitada', -- solicitada | aceita | recusada | concluida | cancelada
    solicitado_em TIMESTAMPTZ NOT NULL,
    respondido_em TIMESTAMPTZ,
    nota_entrega DECIMAL(3, 2),
    nota_pontualidade DECIMAL(3, 2),
    attr_cancelamento BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    UNIQUE (vaga_id, candidato_id),
    FOREIGN KEY (vaga_id) REFERENCES vagas (id),
    FOREIGN KEY (candidato_id) REFERENCES candidatos (id),
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes (id)
);
