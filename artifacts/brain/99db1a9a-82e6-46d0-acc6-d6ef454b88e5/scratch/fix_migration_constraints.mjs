import fs from 'fs';
import path from 'path';

const filePath = 'lib/db/migrations/0000_melted_patch.sql';
let content = fs.readFileSync(filePath, 'utf8');

// Pattern to find: ALTER TABLE "table" ADD CONSTRAINT "constraint"
// Replacement: ALTER TABLE "table" DROP CONSTRAINT IF EXISTS "constraint"; ALTER TABLE "table" ADD CONSTRAINT "constraint"
const regex = /ALTER TABLE "([^"]+)" ADD CONSTRAINT "([^"]+)"/g;
const newContent = content.replace(regex, 'ALTER TABLE "$1" DROP CONSTRAINT IF EXISTS "$2"; ALTER TABLE "$1" ADD CONSTRAINT "$2"');

fs.writeFileSync(filePath, newContent);
console.log('Migration file updated with DROP CONSTRAINT IF EXISTS');
