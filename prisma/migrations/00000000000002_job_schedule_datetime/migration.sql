-- Substitui data + horario_inicio/horario_fim por inicio_em + fim_em (timestamptz UTC).

ALTER TABLE "vagas" ADD COLUMN "inicio_em" TIMESTAMPTZ(6);
ALTER TABLE "vagas" ADD COLUMN "fim_em" TIMESTAMPTZ(6);

UPDATE "vagas"
SET
  "inicio_em" = ("data"::timestamp + "horario_inicio") AT TIME ZONE 'UTC',
  "fim_em" = ("data"::timestamp + "horario_fim") AT TIME ZONE 'UTC';

ALTER TABLE "vagas" ALTER COLUMN "inicio_em" SET NOT NULL;
ALTER TABLE "vagas" ALTER COLUMN "fim_em" SET NOT NULL;

ALTER TABLE "vagas" DROP CONSTRAINT IF EXISTS "vagas_horario_check";
DROP INDEX IF EXISTS "vagas_status_data_idx";

ALTER TABLE "vagas" DROP COLUMN "data";
ALTER TABLE "vagas" DROP COLUMN "horario_inicio";
ALTER TABLE "vagas" DROP COLUMN "horario_fim";

ALTER TABLE "vagas"
ADD CONSTRAINT "vagas_periodo_check" CHECK ("fim_em" > "inicio_em");

CREATE INDEX "vagas_status_inicio_em_idx" ON "vagas"("status", "inicio_em");
