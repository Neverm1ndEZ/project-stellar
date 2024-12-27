-- ===================================================
-- 0) BRAND
-- (Needed before inserting products referencing brand_id=1)
-- ===================================================
INSERT INTO brand (id, name, description, created_at, updated_at)
VALUES
  (1, 'Picklez Inc.', 'Your one-stop for authentic Indian pickles', now(), now());


-- ===================================================
-- 1) CATEGORIES
-- ===================================================
INSERT INTO category (id, parent_id, name, description, created_at, updated_at)
VALUES
  (1, NULL, 'Pickles', 'Traditional Indian pickles of various types', now(), now()),
  (2, 1, 'Mango-Based', 'Pickles made with raw mango as the main ingredient', now(), now()),
  (3, 1, 'Lemon-Based', 'Pickles made with lemon as the main ingredient', now(), now()),
  (4, 1, 'Mixed Vegetable', 'Mixed vegetable pickles with seasonal produce', now(), now());


-- ===================================================
-- 2) PRODUCTS
-- ===================================================
INSERT INTO product (
  id, brand_id, name, short_desc, long_desc,
  original_price, selling_price, sku, available_quantity,
  feature_image, created_at, updated_at
) VALUES
  (1, 1, 'Spicy Mango Pickle',
      'Tangy and spicy raw mango pickle',
      'Freshly prepared with tangy raw mangoes, red chili powder, and aromatic spices.',
      200.00, 180.00, 'SPMNG-001', 100,
      'https://picsum.photos/300?random=1', now(), now()
  ),
  (2, 1, 'Tangy Lemon Pickle',
      'Zesty lemon pickle with a sour kick',
      'Made with fresh lemons, salt, turmeric, and a pinch of fenugreek for extra flavor.',
      150.00, 130.00, 'TNGLM-002', 80,
      'https://picsum.photos/300?random=2', now(), now()
  ),
  (3, 1, 'Gongura Pickle',
      'Authentic Andhra Gongura pickle',
      'Gongura leaves pickled with chili, garlic, and signature Andhra spices.',
      220.00, 200.00, 'GNGRA-003', 60,
      'https://picsum.photos/300?random=3', now(), now()
  ),
  (4, 1, 'Amla Pickle',
      'Gooseberry pickle packed with Vitamin C',
      'A nutritious pickle made with amla (gooseberries), spices, and mustard oil.',
      180.00, 160.00, 'AMLA-004', 70,
      'https://picsum.photos/300?random=4', now(), now()
  ),
  (5, 1, 'Mixed Vegetable Pickle',
      'Crunchy carrot, cauliflower, and chili mix',
      'Seasonal veggies pickled with a robust spice mix for a multi-textured experience.',
      250.00, 220.00, 'MIXVEG-005', 90,
      'https://picsum.photos/300?random=5', now(), now()
  );


-- ===================================================
-- 3) PRODUCT IMAGES
-- (Add multiple images per product, if desired)
-- ===================================================
INSERT INTO product_image (
  id, product_id, url, alt_text, created_at, updated_at
) VALUES
  (1, 1, 'https://picsum.photos/id/101/400', 'Front view - Spicy Mango Pickle', now(), now()),
  (2, 1, 'https://picsum.photos/id/102/400', 'Close-up - Spicy Mango Pickle', now(), now()),
  (3, 2, 'https://picsum.photos/id/103/400', 'Front view - Tangy Lemon Pickle', now(), now()),
  (4, 2, 'https://picsum.photos/id/104/400', 'Close-up - Tangy Lemon Pickle', now(), now()),
  (5, 3, 'https://picsum.photos/id/105/400', 'Front view - Gongura Pickle', now(), now()),
  (6, 3, 'https://picsum.photos/id/106/400', 'Close-up - Gongura Pickle', now(), now()),
  (7, 4, 'https://picsum.photos/id/107/400', 'Front view - Amla Pickle', now(), now()),
  (8, 4, 'https://picsum.photos/id/108/400', 'Close-up - Amla Pickle', now(), now()),
  (9, 5, 'https://picsum.photos/id/109/400', 'Front view - Mixed Veg Pickle', now(), now()),
  (10, 5, 'https://picsum.photos/id/110/400', 'Close-up - Mixed Veg Pickle', now(), now());


-- ===================================================
-- 4) PRODUCT VARIANTS
-- ===================================================
INSERT INTO product_variant (
  id, product_id, variant_name, variant_value, additional_price, available_quantity, created_at, updated_at
) VALUES
  -- Spicy Mango Pickle variants
  (1, 1, 'Size', 'Small Jar (250g)', 0.00, 50, now(), now()),
  (2, 1, 'Size', 'Large Jar (500g)', 50.00, 50, now(), now()),

  -- Tangy Lemon Pickle variants
  (3, 2, 'Size', 'Small Jar (250g)', 0.00, 40, now(), now()),
  (4, 2, 'Size', 'Large Jar (500g)', 40.00, 40, now(), now()),

  -- Gongura Pickle variants
  (5, 3, 'Spice Level', 'Mild', 0.00, 30, now(), now()),
  (6, 3, 'Spice Level', 'Extra Hot', 30.00, 30, now(), now()),

  -- Amla Pickle variants
  (7, 4, 'Size', '250g', 0.00, 40, now(), now()),
  (8, 4, 'Size', '500g', 40.00, 30, now(), now()),

  -- Mixed Vegetable Pickle variants
  (9, 5, 'Size', 'Small Jar (250g)', 0.00, 45, now(), now()),
  (10, 5, 'Size', 'Large Jar (500g)', 50.00, 45, now(), now());


-- ===================================================
-- 5) PRODUCT CATEGORY
-- (Pivot table linking products to categories)
-- ===================================================
INSERT INTO product_category (product_id, category_id)
VALUES
  -- Spicy Mango Pickle belongs to 'Pickles' (1) and 'Mango-Based' (2)
  (1, 1),
  (1, 2),

  -- Tangy Lemon Pickle belongs to 'Pickles' (1) and 'Lemon-Based' (3)
  (2, 1),
  (2, 3),

  -- Gongura Pickle belongs only to 'Pickles' (1)
  (3, 1),

  -- Amla Pickle belongs only to 'Pickles' (1)
  (4, 1),

  -- Mixed Vegetable Pickle belongs to 'Pickles' (1) and 'Mixed Vegetable' (4)
  (5, 1),
  (5, 4);
