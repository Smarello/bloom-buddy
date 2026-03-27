-- AlterTable
ALTER TABLE "Analisi" ADD COLUMN     "collezioneId" TEXT;

-- CreateTable
CREATE TABLE "Collezione" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nomeScientifico" TEXT,
    "utenteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Collezione_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Collezione_utenteId_idx" ON "Collezione"("utenteId");

-- AddForeignKey
ALTER TABLE "Collezione" ADD CONSTRAINT "Collezione_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analisi" ADD CONSTRAINT "Analisi_collezioneId_fkey" FOREIGN KEY ("collezioneId") REFERENCES "Collezione"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DataMigration: crea collezioni dalle combinazioni esistenti (utenteId, nomeComune)
-- Per ogni gruppo prende il nomeScientifico dall'analisi più recente e la data di creazione più vecchia
INSERT INTO "Collezione" ("id", "nome", "nomeScientifico", "utenteId", "createdAt")
SELECT
  gen_random_uuid()::text,
  piuRecente."nomeComune",
  piuRecente."nomeScientifico",
  piuRecente."utenteId",
  piuRecente."primaData"
FROM (
  SELECT DISTINCT ON (a."utenteId", LOWER(a."datiAnalisi"->>'nomeComune'))
    a."utenteId",
    a."datiAnalisi"->>'nomeComune' AS "nomeComune",
    a."datiAnalisi"->>'nomeScientifico' AS "nomeScientifico",
    MIN(a."createdAt") OVER (PARTITION BY a."utenteId", LOWER(a."datiAnalisi"->>'nomeComune')) AS "primaData"
  FROM "Analisi" a
  WHERE a."datiAnalisi"->>'nomeComune' IS NOT NULL
  ORDER BY a."utenteId", LOWER(a."datiAnalisi"->>'nomeComune'), a."createdAt" DESC
) piuRecente;

-- DataMigration: associa ogni analisi alla sua collezione
UPDATE "Analisi" a
SET "collezioneId" = c."id"
FROM "Collezione" c
WHERE c."utenteId" = a."utenteId"
  AND LOWER(c."nome") = LOWER(a."datiAnalisi"->>'nomeComune');
