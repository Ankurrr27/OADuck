-- Question source links are no longer stored or displayed.
ALTER TABLE "question" DROP COLUMN IF EXISTS "source_url";
