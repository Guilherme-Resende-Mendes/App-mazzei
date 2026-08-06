-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('owner', 'client', 'admin');

-- CreateEnum
CREATE TYPE "Area" AS ENUM ('cozinha', 'salao', 'bar');

-- CreateEnum
CREATE TYPE "Badge" AS ENUM ('pontual', 'flexivel');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('aberta', 'preenchida', 'cancelada', 'concluida');

-- CreateEnum
CREATE TYPE "HiringStatus" AS ENUM ('solicitada', 'aceita', 'recusada', 'concluida', 'cancelada');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "papel" "Role" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_login_em" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expira_em" TIMESTAMPTZ(6) NOT NULL,
    "revogado_em" TIMESTAMPTZ(6),
    "user_agent" VARCHAR(255),
    "ip" VARCHAR(64),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargos" (
    "id" UUID NOT NULL,
    "area_id" "Area" NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "nivel" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cargos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurantes" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "cpf_cnpj" VARCHAR(20) NOT NULL,
    "endereco" TEXT NOT NULL,
    "telefone" VARCHAR(30) NOT NULL,
    "nivel_exigencia" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "restaurantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidatos" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "documento" VARCHAR(30) NOT NULL,
    "endereco" TEXT NOT NULL,
    "telefone" VARCHAR(30) NOT NULL,
    "cargo_id" UUID NOT NULL,
    "pretensao_salarial" DECIMAL(10,2) NOT NULL,
    "nota_geral" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "bio" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "candidatos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidato_selos" (
    "candidato_id" UUID NOT NULL,
    "selo" "Badge" NOT NULL,
    "concedido_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "candidato_selos_pkey" PRIMARY KEY ("candidato_id","selo")
);

-- CreateTable
CREATE TABLE "vagas" (
    "id" UUID NOT NULL,
    "restaurante_id" UUID NOT NULL,
    "cargo_id" UUID NOT NULL,
    "data" DATE NOT NULL,
    "horario_inicio" TIME(0) NOT NULL,
    "horario_fim" TIME(0) NOT NULL,
    "qtd_pessoas" INTEGER NOT NULL DEFAULT 1,
    "status" "JobStatus" NOT NULL DEFAULT 'aberta',
    "observacao" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "vagas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contratacoes" (
    "id" UUID NOT NULL,
    "vaga_id" UUID NOT NULL,
    "candidato_id" UUID NOT NULL,
    "restaurante_id" UUID NOT NULL,
    "preco_acordado" DECIMAL(10,2),
    "status" "HiringStatus" NOT NULL DEFAULT 'solicitada',
    "solicitado_em" TIMESTAMPTZ(6) NOT NULL,
    "respondido_em" TIMESTAMPTZ(6),
    "nota_entrega" DECIMAL(3,2),
    "nota_pontualidade" DECIMAL(3,2),
    "attr_cancelamento" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "contratacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_papel_idx" ON "usuarios"("papel");

-- CreateIndex
CREATE INDEX "refresh_tokens_usuario_id_idx" ON "refresh_tokens"("usuario_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "cargos_area_id_idx" ON "cargos"("area_id");

-- CreateIndex
CREATE UNIQUE INDEX "restaurantes_usuario_id_key" ON "restaurantes"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "restaurantes_cpf_cnpj_key" ON "restaurantes"("cpf_cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "candidatos_usuario_id_key" ON "candidatos"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "candidatos_documento_key" ON "candidatos"("documento");

-- CreateIndex
CREATE INDEX "candidatos_cargo_id_idx" ON "candidatos"("cargo_id");

-- CreateIndex
CREATE INDEX "vagas_restaurante_id_idx" ON "vagas"("restaurante_id");

-- CreateIndex
CREATE INDEX "vagas_cargo_id_idx" ON "vagas"("cargo_id");

-- CreateIndex
CREATE INDEX "vagas_status_data_idx" ON "vagas"("status", "data");

-- CreateIndex
CREATE INDEX "contratacoes_vaga_id_idx" ON "contratacoes"("vaga_id");

-- CreateIndex
CREATE INDEX "contratacoes_candidato_id_idx" ON "contratacoes"("candidato_id");

-- CreateIndex
CREATE INDEX "contratacoes_status_idx" ON "contratacoes"("status");

-- CreateIndex
CREATE UNIQUE INDEX "contratacoes_vaga_id_candidato_id_key" ON "contratacoes"("vaga_id", "candidato_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurantes" ADD CONSTRAINT "restaurantes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidatos" ADD CONSTRAINT "candidatos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidatos" ADD CONSTRAINT "candidatos_cargo_id_fkey" FOREIGN KEY ("cargo_id") REFERENCES "cargos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidato_selos" ADD CONSTRAINT "candidato_selos_candidato_id_fkey" FOREIGN KEY ("candidato_id") REFERENCES "candidatos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vagas" ADD CONSTRAINT "vagas_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vagas" ADD CONSTRAINT "vagas_cargo_id_fkey" FOREIGN KEY ("cargo_id") REFERENCES "cargos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratacoes" ADD CONSTRAINT "contratacoes_vaga_id_fkey" FOREIGN KEY ("vaga_id") REFERENCES "vagas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratacoes" ADD CONSTRAINT "contratacoes_candidato_id_fkey" FOREIGN KEY ("candidato_id") REFERENCES "candidatos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contratacoes" ADD CONSTRAINT "contratacoes_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CheckConstraints (integridade de dominio)
ALTER TABLE "cargos" ADD CONSTRAINT "cargos_nivel_check" CHECK ("nivel" >= 1);
ALTER TABLE "restaurantes" ADD CONSTRAINT "restaurantes_nivel_exigencia_check" CHECK ("nivel_exigencia" IS NULL OR ("nivel_exigencia" BETWEEN 1 AND 5));
ALTER TABLE "candidatos" ADD CONSTRAINT "candidatos_pretensao_check" CHECK ("pretensao_salarial" >= 0);
ALTER TABLE "candidatos" ADD CONSTRAINT "candidatos_nota_geral_check" CHECK ("nota_geral" BETWEEN 0 AND 5);
ALTER TABLE "vagas" ADD CONSTRAINT "vagas_qtd_pessoas_check" CHECK ("qtd_pessoas" >= 1);
ALTER TABLE "vagas" ADD CONSTRAINT "vagas_horario_check" CHECK ("horario_fim" > "horario_inicio");
ALTER TABLE "contratacoes" ADD CONSTRAINT "contratacoes_nota_entrega_check" CHECK ("nota_entrega" IS NULL OR ("nota_entrega" BETWEEN 0 AND 5));
ALTER TABLE "contratacoes" ADD CONSTRAINT "contratacoes_nota_pontualidade_check" CHECK ("nota_pontualidade" IS NULL OR ("nota_pontualidade" BETWEEN 0 AND 5));
ALTER TABLE "contratacoes" ADD CONSTRAINT "contratacoes_preco_check" CHECK ("preco_acordado" IS NULL OR "preco_acordado" >= 0);

