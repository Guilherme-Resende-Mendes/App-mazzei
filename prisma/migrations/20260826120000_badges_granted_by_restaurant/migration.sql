-- `candidato_selos` deixa de ser um par unico (candidato, selo) e passa a ser um log
-- de concessoes: o restaurante concede o selo ancorado numa contratacao concluida sua,
-- e o mesmo selo pode se repetir para o candidato (uma vez por contratacao).
--
-- Os selos existentes foram concedidos por ADMIN sem vinculo com restaurante ou
-- contratacao, logo nao ha como atribuir autoria nem comprovar o trabalho concluido.
-- Sem backfill possivel, o historico legado e descartado.

-- DropForeignKey
ALTER TABLE "candidato_selos" DROP CONSTRAINT "candidato_selos_candidato_id_fkey";

-- DropTable
DROP TABLE "candidato_selos";

-- CreateTable
CREATE TABLE "candidato_selos" (
    "id" UUID NOT NULL,
    "candidato_id" UUID NOT NULL,
    "restaurante_id" UUID NOT NULL,
    "contratacao_id" UUID NOT NULL,
    "selo" "Badge" NOT NULL,
    "concedido_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "candidato_selos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "candidato_selos_contratacao_id_selo_key" ON "candidato_selos"("contratacao_id", "selo");

-- CreateIndex
CREATE INDEX "candidato_selos_candidato_id_selo_idx" ON "candidato_selos"("candidato_id", "selo");

-- CreateIndex
CREATE INDEX "candidato_selos_restaurante_id_idx" ON "candidato_selos"("restaurante_id");

-- AddForeignKey
ALTER TABLE "candidato_selos" ADD CONSTRAINT "candidato_selos_candidato_id_fkey" FOREIGN KEY ("candidato_id") REFERENCES "candidatos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidato_selos" ADD CONSTRAINT "candidato_selos_restaurante_id_fkey" FOREIGN KEY ("restaurante_id") REFERENCES "restaurantes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidato_selos" ADD CONSTRAINT "candidato_selos_contratacao_id_fkey" FOREIGN KEY ("contratacao_id") REFERENCES "contratacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
