-- Selos deixam de ser enum nativo e passam a ser catalogo em tabela (`selos`),
-- para que nome, descricao, icone e ordenacao virem dado administravel em runtime
-- e novos selos nao exijam migration + deploy.
--
-- O identificador publico continua sendo o slug, que ja era o valor do enum, entao
-- a coluna `candidato_selos.selo` e reaproveitada: muda de tipo, nao de nome. Os
-- valores do enum eram gravados em minusculas (@map), por isso o UPPER na conversao.

-- CreateTable
CREATE TABLE "selos" (
    "slug" VARCHAR(50) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "descricao" TEXT,
    "icone" VARCHAR(100),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "selos_pkey" PRIMARY KEY ("slug")
);

-- CreateIndex
CREATE INDEX "selos_ativo_ordem_idx" ON "selos"("ativo", "ordem");

-- Converte os valores do enum em linhas do catalogo
INSERT INTO "selos" ("slug", "nome", "ordem", "updated_at") VALUES
    ('PONTUAL', 'Pontual', 1, CURRENT_TIMESTAMP),
    ('FLEXIVEL', 'Flexivel', 2, CURRENT_TIMESTAMP);

-- AlterTable: enum "Badge" -> VARCHAR referenciando o catalogo
ALTER TABLE "candidato_selos"
    ALTER COLUMN "selo" TYPE VARCHAR(50) USING UPPER("selo"::text);

-- AddForeignKey
ALTER TABLE "candidato_selos" ADD CONSTRAINT "candidato_selos_selo_fkey" FOREIGN KEY ("selo") REFERENCES "selos"("slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropEnum
DROP TYPE "Badge";
