-- Add hourly rate to hirings
ALTER TABLE "contratacoes" ADD COLUMN "valor_hora" DECIMAL(10,2);

-- Backfill from candidate expected salary
UPDATE "contratacoes" AS h
SET "valor_hora" = c."pretensao_salarial"
FROM "candidatos" AS c
WHERE h."candidato_id" = c."id";

-- Enforce NOT NULL and positive values
ALTER TABLE "contratacoes" ALTER COLUMN "valor_hora" SET NOT NULL;
ALTER TABLE "contratacoes" ADD CONSTRAINT "contratacoes_valor_hora_check" CHECK ("valor_hora" >= 0);

-- Remove expected salary from candidates
ALTER TABLE "candidatos" DROP CONSTRAINT "candidatos_pretensao_check";
ALTER TABLE "candidatos" DROP COLUMN "pretensao_salarial";
