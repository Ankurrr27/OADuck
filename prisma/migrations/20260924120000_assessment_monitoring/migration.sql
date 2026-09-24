ALTER TABLE "session"
  ADD COLUMN "monitoring_mode" TEXT NOT NULL DEFAULT 'NORMAL',
  ADD COLUMN "violation_count" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "assessment_violation" (
  "id" UUID NOT NULL,
  "assessment_id" UUID NOT NULL,
  "type" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "assessment_violation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "assessment_violation_assessment_id_fkey"
    FOREIGN KEY ("assessment_id") REFERENCES "session"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "assessment_violation_assessment_id_timestamp_idx"
  ON "assessment_violation"("assessment_id", "timestamp");
