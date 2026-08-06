-- AlterTable
ALTER TABLE "vagas" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "vagas_active_idx" ON "vagas"("active");
