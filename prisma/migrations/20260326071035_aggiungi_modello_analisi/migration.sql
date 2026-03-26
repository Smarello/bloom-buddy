-- CreateTable
CREATE TABLE "Analisi" (
    "id" TEXT NOT NULL,
    "urlFoto" TEXT NOT NULL,
    "datiAnalisi" JSONB NOT NULL,
    "hashFoto" TEXT NOT NULL,
    "utenteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analisi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Analisi_utenteId_hashFoto_key" ON "Analisi"("utenteId", "hashFoto");

-- AddForeignKey
ALTER TABLE "Analisi" ADD CONSTRAINT "Analisi_utenteId_fkey" FOREIGN KEY ("utenteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
