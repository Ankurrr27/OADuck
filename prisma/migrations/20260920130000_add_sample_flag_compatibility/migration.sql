ALTER TABLE "test_case" ADD COLUMN IF NOT EXISTS "is_sample" BOOLEAN;

UPDATE "test_case"
SET "is_sample" = NOT COALESCE("is_hidden", false)
WHERE "is_sample" IS NULL;

ALTER TABLE "test_case"
  ALTER COLUMN "is_sample" SET DEFAULT true;

ALTER TABLE "test_case"
  ALTER COLUMN "is_sample" SET NOT NULL;
