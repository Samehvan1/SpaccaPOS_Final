UPDATE "order_item_customizations" c
SET "cost_per_unit" = i.cost_per_unit
FROM "ingredients" i
WHERE c.ingredient_id = i.id AND c.cost_per_unit = '0';