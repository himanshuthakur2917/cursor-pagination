-- ============================================================================
-- 02_seed_data.sql
-- Efficient bulk insertion of 200,000 products using generate_series
-- ============================================================================
--
-- WHY generate_series?
-- ────────────────────
-- This inserts all 200,000 rows in a SINGLE SQL statement executed entirely
-- server-side. There are no network round-trips, no client-side loops, no ORM
-- overhead. On a typical Supabase instance, this completes in ~2-5 seconds.
--
-- Comparison of approaches:
--   ┌──────────────────────────┬────────────┬────────────────────────────┐
--   │ Method                   │ Speed      │ Notes                      │
--   ├──────────────────────────┼────────────┼────────────────────────────┤
--   │ Single-row INSERT loop   │ ~10+ min   │ 200K network round-trips   │
--   │ Multi-value INSERT batch │ ~30 sec    │ 40 batches of 5000 rows    │
--   │ UNNEST with arrays       │ ~10 sec    │ 4 arrays, single query     │
--   │ generate_series (this)   │ ~2-5 sec   │ Pure server-side, fastest  │
--   │ COPY                     │ ~1-2 sec   │ Requires file/stdin access │
--   └──────────────────────────┴────────────┴────────────────────────────┘
--
-- USAGE:
-- Run this in Supabase SQL Editor or via the seed script (pnpm seed).
-- Make sure 01_schema_and_cursor_queries.sql has been executed first.
--
-- ============================================================================

-- Clear existing data (optional — uncomment if re-seeding)
-- TRUNCATE TABLE products;

-- Insert 200,000 products in a single statement
INSERT INTO products (id, name, category, price, created_at, updated_at)
SELECT
  -- Unique UUID for each product
  gen_random_uuid() AS id,

  -- Product name: "Product 1", "Product 2", ..., "Product 200000"
  'Product ' || gs AS name,

  -- Category: evenly distributed across 10 categories (~20,000 each)
  -- Using modular arithmetic to cycle through the array
  (ARRAY[
    'Electronics',
    'Clothing',
    'Books',
    'Home & Garden',
    'Sports',
    'Toys',
    'Automotive',
    'Health',
    'Food',
    'Office'
  ])[1 + (gs % 10)] AS category,

  -- Price: random between $1.00 and $1000.00, rounded to 2 decimal places
  ROUND((RANDOM() * 999 + 1)::numeric, 2) AS price,

  -- created_at: staggered timestamps going back from NOW()
  -- Product 1 = NOW() - 1 second, Product 200000 = NOW() - 200000 seconds (~55 hours ago)
  -- This ensures every product has a unique created_at for meaningful pagination ordering
  NOW() - (gs || ' seconds')::interval AS created_at,

  -- updated_at: created_at + random offset (0 to 3600 seconds)
  -- Simulates products being updated at various times after creation
  NOW() - (gs || ' seconds')::interval
       + ((RANDOM() * 3600)::int || ' seconds')::interval AS updated_at

FROM generate_series(1, 200000) AS gs;

-- ============================================================================
-- VERIFICATION QUERIES (run after seeding)
-- ============================================================================

-- Total count — should be 200,000
SELECT COUNT(*) AS total_products FROM products;

-- Category distribution — should be ~20,000 per category
SELECT category, COUNT(*) AS count
FROM products
GROUP BY category
ORDER BY category;

-- Price range — should be between ~$1.00 and ~$1000.00
SELECT
  MIN(price) AS min_price,
  MAX(price) AS max_price,
  ROUND(AVG(price)::numeric, 2) AS avg_price
FROM products;

-- Timestamp range — should span ~55 hours
SELECT
  MIN(created_at) AS oldest,
  MAX(created_at) AS newest
FROM products;
