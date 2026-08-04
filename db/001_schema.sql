-- Danilo Mazzei App — schema PostgreSQL (MVP)
-- Fluxo: restaurante cria vaga → filtra candidatos → solicita → responde → avalia
-- Pagamento fora da plataforma no MVP

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE area_tipo AS ENUM ('cozinha', 'salao', 'bar');

CREATE TYPE vaga_status AS ENUM ('aberta', 'preenchida', 'cancelada');

CREATE TYPE contratacao_status AS ENUM (
  'solicitada',
  'aceita',
  'recusada',
  'concluida',
  'cancelada'
);

CREATE TYPE selo_tipo AS ENUM ('pontual', 'flexivel');

CREATE TYPE papel_tipo AS ENUM ('owner', 'client', 'admin');

-- ---------------------------------------------------------------------------
-- Auth / acesso
-- owner → restaurante | client → candidato | admin → equipe (sem perfil)
-- ---------------------------------------------------------------------------

CREATE TABLE usuarios (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    email text NOT NULL UNIQUE,
    senha_hash text NOT NULL,
    papel papel_tipo NOT NULL,
    ativo boolean NOT NULL DEFAULT true,
    ultimo_login_em timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Catálogo fechado (régua da plataforma)
-- ---------------------------------------------------------------------------

CREATE TABLE areas (
    id area_tipo PRIMARY KEY,
    nome text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE cargos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    area_id area_tipo NOT NULL REFERENCES areas (id),
    nome text NOT NULL,
    nivel int NOT NULL CHECK (nivel >= 1),
    ativo boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (area_id, nome)
);

-- ---------------------------------------------------------------------------
-- Atores
-- ---------------------------------------------------------------------------

CREATE TABLE restaurantes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    usuario_id uuid NOT NULL UNIQUE REFERENCES usuarios (id),
    nome text NOT NULL,
    cpf_cnpj text NOT NULL UNIQUE,
    endereco text NOT NULL,
    telefone text NOT NULL,
    nivel_exigencia int CHECK (
        nivel_exigencia BETWEEN 1 AND 5
    ), -- opcional MVP
    ativo boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE candidatos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    usuario_id uuid NOT NULL UNIQUE REFERENCES usuarios (id),
    nome text NOT NULL,
    documento text NOT NULL UNIQUE,
    endereco text NOT NULL,
    telefone text NOT NULL,
    cargo_id uuid NOT NULL REFERENCES cargos (id),
    pretensao_salarial numeric(10, 2) NOT NULL CHECK (pretensao_salarial >= 0),
    nota_geral numeric(3, 2) NOT NULL DEFAULT 0 CHECK (nota_geral BETWEEN 0 AND 5),
    bio text,
    ativo boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE candidato_selos (
    candidato_id uuid NOT NULL REFERENCES candidatos (id) ON DELETE CASCADE,
    selo selo_tipo NOT NULL,
    concedido_em timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (candidato_id, selo)
);

-- ---------------------------------------------------------------------------
-- Demanda
-- ---------------------------------------------------------------------------

CREATE TABLE vagas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    restaurante_id uuid NOT NULL REFERENCES restaurantes (id),
    cargo_id uuid NOT NULL REFERENCES cargos (id),
    data date NOT NULL,
    horario_inicio time NOT NULL,
    horario_fim time NOT NULL,
    qtd_pessoas int NOT NULL DEFAULT 1 CHECK (qtd_pessoas >= 1),
    status vaga_status NOT NULL DEFAULT 'aberta',
    observacao text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CHECK (horario_fim > horario_inicio)
);

-- ---------------------------------------------------------------------------
-- Match / contratação (N:N vaga ↔ candidato)
-- ---------------------------------------------------------------------------

CREATE TABLE contratacoes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    vaga_id uuid NOT NULL REFERENCES vagas (id),
    candidato_id uuid NOT NULL REFERENCES candidatos (id),
    restaurante_id uuid NOT NULL REFERENCES restaurantes (id),
    preco_acordado numeric(10, 2) CHECK (
        preco_acordado IS NULL
        OR preco_acordado >= 0
    ),
    status contratacao_status NOT NULL DEFAULT 'solicitada',
    solicitado_em timestamptz NOT NULL DEFAULT now(),
    respondido_em timestamptz,
    nota_entrega numeric(3, 2) CHECK (
        nota_entrega IS NULL
        OR nota_entrega BETWEEN 0 AND 5
    ),
    nota_pontualidade numeric(3, 2) CHECK (
        nota_pontualidade IS NULL
        OR nota_pontualidade BETWEEN 0 AND 5
    ),
    attr_cancelamento boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (vaga_id, candidato_id)
);

-- ---------------------------------------------------------------------------
-- Índices (filtros MVP + histórico)
-- ---------------------------------------------------------------------------

CREATE INDEX idx_usuarios_papel ON usuarios (papel)
WHERE
    ativo;

CREATE INDEX idx_cargos_area ON cargos (area_id) WHERE ativo;

CREATE INDEX idx_candidatos_filtro ON candidatos (cargo_id, nota_geral DESC)
WHERE
    ativo;

CREATE INDEX idx_vagas_abertas ON vagas (cargo_id, data, status)
WHERE
    status = 'aberta';

CREATE INDEX idx_vagas_restaurante ON vagas (restaurante_id, data DESC);

CREATE INDEX idx_contratacoes_candidato ON contratacoes (
    candidato_id,
    status,
    solicitado_em DESC
);

CREATE INDEX idx_contratacoes_restaurante ON contratacoes (
    restaurante_id,
    status,
    solicitado_em DESC
);

CREATE INDEX idx_contratacoes_vaga ON contratacoes (vaga_id, status);

-- ---------------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER trg_restaurantes_updated_at
  BEFORE UPDATE ON restaurantes
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER trg_candidatos_updated_at
  BEFORE UPDATE ON candidatos
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER trg_vagas_updated_at
  BEFORE UPDATE ON vagas
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

CREATE TRIGGER trg_contratacoes_updated_at
  BEFORE UPDATE ON contratacoes
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- ---------------------------------------------------------------------------
-- Recalcula nota_geral do candidato (média de avaliações concluídas)
-- Cancelamento NÃO entra na nota (attr separado, conforme alinhamento)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION recalc_nota_geral(p_candidato_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE candidatos c
  SET nota_geral = COALESCE((
    SELECT ROUND(AVG((ct.nota_entrega + ct.nota_pontualidade) / 2.0)::numeric, 2)
    FROM contratacoes ct
    WHERE ct.candidato_id = p_candidato_id
      AND ct.status = 'concluida'
      AND ct.nota_entrega IS NOT NULL
      AND ct.nota_pontualidade IS NOT NULL
      AND ct.attr_cancelamento = false
  ), 0)
  WHERE c.id = p_candidato_id;
END;
$$;

CREATE OR REPLACE FUNCTION trg_recalc_nota_geral()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'concluida'
     AND NEW.nota_entrega IS NOT NULL
     AND NEW.nota_pontualidade IS NOT NULL THEN
    PERFORM recalc_nota_geral(NEW.candidato_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_contratacoes_nota
  AFTER INSERT OR UPDATE OF status, nota_entrega, nota_pontualidade, attr_cancelamento
  ON contratacoes
  FOR EACH ROW EXECUTE PROCEDURE trg_recalc_nota_geral();

-- ---------------------------------------------------------------------------
-- Views úteis do MVP
-- ---------------------------------------------------------------------------

-- Histórico visível: vezes contratado, por quem, último preço
CREATE OR REPLACE VIEW vw_historico_candidato AS
SELECT
    c.id AS candidato_id,
    c.nome AS candidato_nome,
    COUNT(*) FILTER (
        WHERE
            ct.status = 'concluida'
    ) AS vezes_contratado,
    COUNT(DISTINCT ct.restaurante_id) FILTER (
        WHERE
            ct.status = 'concluida'
    ) AS restaurantes_distintos,
    (
        SELECT ct2.preco_acordado
        FROM contratacoes ct2
        WHERE
            ct2.candidato_id = c.id
            AND ct2.status = 'concluida'
            AND ct2.preco_acordado IS NOT NULL
        ORDER BY ct2.respondido_em DESC NULLS LAST, ct2.created_at DESC
        LIMIT 1
    ) AS ultimo_preco,
    c.nota_geral,
    c.pretensao_salarial
FROM candidatos c
    LEFT JOIN contratacoes ct ON ct.candidato_id = c.id
GROUP BY
    c.id;

-- Filtro restaurante: área + cargo + nota
CREATE OR REPLACE VIEW vw_candidatos_busca AS
SELECT
    c.id,
    c.nome,
    c.telefone,
    c.pretensao_salarial,
    c.nota_geral,
    c.bio,
    cg.id AS cargo_id,
    cg.nome AS cargo_nome,
    cg.nivel AS cargo_nivel,
    a.id AS area_id,
    a.nome AS area_nome,
    COALESCE(
        ARRAY_AGG(
            cs.selo
            ORDER BY cs.selo
        ) FILTER (
            WHERE
                cs.selo IS NOT NULL
        ),
        '{}'
    ) AS selos
FROM
    candidatos c
    JOIN cargos cg ON cg.id = c.cargo_id
    JOIN areas a ON a.id = cg.area_id
    LEFT JOIN candidato_selos cs ON cs.candidato_id = c.id
WHERE
    c.ativo
GROUP BY
    c.id,
    cg.id,
    a.id;