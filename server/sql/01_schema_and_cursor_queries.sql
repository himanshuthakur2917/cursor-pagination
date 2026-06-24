

CREATE TABLE IF NOT EXISTS products (
  id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(255)    NOT NULL,
  category    VARCHAR(100)    NOT NULL,
  price       NUMERIC(10, 2)  NOT NULL,
  created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_products_created_at_id
  ON products (created_at DESC, id DESC);


CREATE INDEX IF NOT EXISTS idx_products_category_created_at_id
  ON products (category, created_at DESC, id DESC);



-- 3a. FIRST PAGE (no cursor) — newest products first
-- Used when the user first loads the page.
-- Fetches limit+1 rows to detect if a next page exists.
SELECT id, name, category, price, created_at, updated_at
FROM products
ORDER BY created_at DESC, id DESC
LIMIT 21;  -- 20 items + 1 to detect hasNextPage


-- 3b. NEXT PAGE (forward pagination with cursor)
-- After the user clicks "Next", the client sends back the last row's
-- created_at and id as the cursor.
-- Row-value comparison: (created_at, id) < ($1, $2) is equivalent to:
--   created_at < $1 OR (created_at = $1 AND id < $2)
-- PostgreSQL handles this natively with the composite index.
SELECT id, name, category, price, created_at, updated_at
FROM products
WHERE (created_at, id) < ($1, $2)   -- $1 = cursor_created_at, $2 = cursor_id
ORDER BY created_at DESC, id DESC
LIMIT 21;  -- 20 items + 1 to detect hasNextPage


-- 3c. PREVIOUS PAGE (backward pagination with cursor)
-- To go back, we reverse the direction: fetch rows GREATER than the first
-- item on the current page, sorted ASC, then re-sort DESC in the outer query.
SELECT * FROM (
  SELECT id, name, category, price, created_at, updated_at
  FROM products
  WHERE (created_at, id) > ($1, $2)   -- $1 = first item's created_at, $2 = first item's id
  ORDER BY created_at ASC, id ASC
  LIMIT 21  -- 20 items + 1 to detect hasPreviousPage
) AS prev_page
ORDER BY created_at DESC, id DESC;


-- 3d. CATEGORY FILTER + FORWARD CURSOR PAGINATION
-- When the user filters by category AND paginates.
-- Uses the idx_products_category_created_at_id index.
SELECT id, name, category, price, created_at, updated_at
FROM products
WHERE category = $1                   -- $1 = category name
  AND (created_at, id) < ($2, $3)    -- $2 = cursor_created_at, $3 = cursor_id
ORDER BY created_at DESC, id DESC
LIMIT 21;


-- 3e. CATEGORY FILTER + FIRST PAGE (no cursor)
SELECT id, name, category, price, created_at, updated_at
FROM products
WHERE category = $1                   -- $1 = category name
ORDER BY created_at DESC, id DESC
LIMIT 21;


-- 3f. CATEGORY FILTER + BACKWARD CURSOR PAGINATION
SELECT * FROM (
  SELECT id, name, category, price, created_at, updated_at
  FROM products
  WHERE category = $1                 -- $1 = category name
    AND (created_at, id) > ($2, $3)  -- $2 = cursor_created_at, $3 = cursor_id
  ORDER BY created_at ASC, id ASC
  LIMIT 21
) AS prev_page
ORDER BY created_at DESC, id DESC;


-- 3g. GET DISTINCT CATEGORIES (for filter dropdown)
SELECT DISTINCT category
FROM products
ORDER BY category ASC;


-- 3h. TOTAL COUNT (for UI display — use sparingly, can be slow on very large tables)
-- Unfiltered:
SELECT COUNT(*) AS total FROM products;
-- Filtered:
SELECT COUNT(*) AS total FROM products WHERE category = $1;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. EXPLAIN ANALYZE (for verifying index usage — run in Supabase SQL Editor)
-- ─────────────────────────────────────────────────────────────────────────────

-- Should show "Index Scan Backward" on idx_products_created_at_id
-- EXPLAIN ANALYZE
-- SELECT id, name, category, price, created_at, updated_at
-- FROM products
-- ORDER BY created_at DESC, id DESC
-- LIMIT 20;

-- Should show "Index Scan" on idx_products_category_created_at_id
-- EXPLAIN ANALYZE
-- SELECT id, name, category, price, created_at, updated_at
-- FROM products
-- WHERE category = 'Electronics'
--   AND (created_at, id) < (NOW(), gen_random_uuid())
-- ORDER BY created_at DESC, id DESC
-- LIMIT 20;
