-- 1. Ensure Main Branch exists
INSERT INTO branches (name, code, address) 
VALUES ('Main Branch', 'MAIN', '123 Coffee St.')
ON CONFLICT (code) DO NOTHING;

-- 2. Link all existing users to the Main Branch
UPDATE users 
SET branch_id = (SELECT id FROM branches WHERE code = 'MAIN' LIMIT 1)
WHERE branch_id IS NULL;

-- 3. Migrate stock from ingredients to branch_stock for the Main Branch
INSERT INTO branch_stock (branch_id, ingredient_id, stock_quantity, low_stock_threshold)
SELECT 
    (SELECT id FROM branches WHERE code = 'MAIN' LIMIT 1), 
    id, 
    stock_quantity, 
    low_stock_threshold
FROM ingredients
ON CONFLICT (branch_id, ingredient_id) DO UPDATE 
SET 
    stock_quantity = EXCLUDED.stock_quantity,
    low_stock_threshold = EXCLUDED.low_stock_threshold;

-- 4. Update existing stock movements to belong to the Main Branch
UPDATE stock_movements
SET branch_id = (SELECT id FROM branches WHERE code = 'MAIN' LIMIT 1)
WHERE branch_id IS NULL;
