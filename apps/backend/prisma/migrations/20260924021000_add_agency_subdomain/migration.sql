-- Add system-owned subdomain with backfill for existing agencies.
-- New rows get theirs from allocateSubdomain() at register time.
ALTER TABLE "Agency" ADD COLUMN "subdomain" TEXT;

WITH slugged AS (
  SELECT
    id,
    left(regexp_replace(lower(trim(name)), '[^a-z0-9]+', '-', 'g'), 60) AS raw
  FROM "Agency"
),
ranked AS (
  SELECT
    id,
    COALESCE(NULLIF(trim(both '-' from raw), ''), 'agency') AS base,
    ROW_NUMBER() OVER (
      PARTITION BY COALESCE(NULLIF(trim(both '-' from raw), ''), 'agency')
      ORDER BY id
    ) AS rn
  FROM slugged
)
UPDATE "Agency" AS a
SET "subdomain" = r.base || CASE WHEN r.rn > 1 THEN '-' || r.rn::text ELSE '' END
FROM ranked AS r
WHERE a.id = r.id;

ALTER TABLE "Agency" ALTER COLUMN "subdomain" SET NOT NULL;
CREATE UNIQUE INDEX "Agency_subdomain_key" ON "Agency"("subdomain");
