-- Add catalogue-specific fields to Product for the perfume catalog integration
ALTER TABLE "Product"
ADD COLUMN "brand" TEXT,
ADD COLUMN "gender" TEXT,
ADD COLUMN "isNew" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "sourcePage" INTEGER,
ADD COLUMN "arabicName" TEXT,
ADD COLUMN "lineEquivalent" TEXT,
ADD COLUMN "catalogOrder" INTEGER;

CREATE INDEX "Product_brand_idx" ON "Product"("brand");
CREATE INDEX "Product_gender_idx" ON "Product"("gender");
CREATE INDEX "Product_isNew_idx" ON "Product"("isNew");
CREATE INDEX "Product_catalogOrder_idx" ON "Product"("catalogOrder");
