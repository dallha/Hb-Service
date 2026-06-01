-- CreateTable: Transaction (comptabilité)
CREATE TABLE IF NOT EXISTS "Transaction" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'expense', -- 'expense' | 'revenue'
    "amount" DOUBLE PRECISION NOT NULL,
    "motif" TEXT,
    "source" TEXT DEFAULT 'xlsx',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Transaction_date_idx" ON "Transaction"("date");
CREATE INDEX IF NOT EXISTS "Transaction_type_idx" ON "Transaction"("type");
