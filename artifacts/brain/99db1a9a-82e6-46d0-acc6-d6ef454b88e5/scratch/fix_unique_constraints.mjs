import fs from 'fs';

const filePath = 'lib/db/migrations/0000_melted_patch.sql';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Define the constraints to move out
const constraints = [
    { table: 'users', name: 'users_username_unique', column: 'username' },
    { table: 'ingredients', name: 'ingredients_slug_unique', column: 'slug' },
    { table: 'drink_categories', name: 'drink_categories_name_unique', column: 'name' },
    { table: 'kitchen_stations', name: 'kitchen_stations_name_unique', column: 'name' },
    { table: 'orders', name: 'orders_order_number_unique', column: 'order_number' },
    { table: 'discounts', name: 'discounts_code_unique', column: 'code' },
    { table: 'permissions', name: 'permissions_key_unique', column: 'key' }
];

// 2. Remove them from CREATE TABLE blocks
for (const c of constraints) {
    // Matches: , [newline] [tabs/spaces] CONSTRAINT "name" UNIQUE("column")
    const regex = new RegExp(`,\\s+CONSTRAINT "${c.name}" UNIQUE\\("${c.column}"\\)`, 'g');
    content = content.replace(regex, '');
}

// 3. Create the safe ALTER TABLE statements
const safeAlterStatements = constraints.map(c => 
    `ALTER TABLE "${c.table}" DROP CONSTRAINT IF EXISTS "${c.name}"; ALTER TABLE "${c.table}" ADD CONSTRAINT "${c.name}" UNIQUE("${c.column}");`
).join('--> statement-breakpoint\n') + '--> statement-breakpoint\n';

// 4. Insert these unique constraints BEFORE the Foreign Key section (around line 338)
const breakpoint = '--> statement-breakpoint\nALTER TABLE "ingredient_options"';
content = content.replace(breakpoint, safeAlterStatements + breakpoint);

fs.writeFileSync(filePath, content);
console.log('Migration file updated: Unique constraints moved to safe standalone statements.');
