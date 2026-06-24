

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
