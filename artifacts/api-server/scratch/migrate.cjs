const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:mero1901@localhost:5432/spacca_local'
});

async function main() {
  await client.connect();
  console.log("Activating all ingredient type volumes...");
  const res = await client.query('UPDATE ingredient_type_volumes SET is_active = true');
  console.log(`Done. Updated ${res.rowCount} rows.`);
  await client.end();
}

main().catch(console.error);
