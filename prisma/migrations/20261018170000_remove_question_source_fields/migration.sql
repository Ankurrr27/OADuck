-- Question source metadata is no longer part of the question model.
ALTER TABLE "question" DROP COLUMN IF EXISTS "source";
ALTER TABLE "question" DROP COLUMN IF EXISTS "leetcode_slug";
ALTER TABLE "question" DROP COLUMN IF EXISTS "leetcode_id";
