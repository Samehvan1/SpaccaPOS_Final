import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://postgres:mero1901@localhost:5432/spacca_local"
});

async function run() {
  await client.connect();
  
  const stationsRes = await client.query('SELECT * FROM kitchen_stations ORDER BY sort_order, name');
  console.log("=== KITCHEN STATIONS ===");
  console.table(stationsRes.rows);

  const ordersRes = await client.query('SELECT id, order_number, status, branch_id, payment_method, created_at, paid_at FROM orders ORDER BY id DESC LIMIT 10');
  console.log("\n=== RECENT ORDERS ===");
  console.table(ordersRes.rows);

  const itemsRes = await client.query('SELECT id, order_id, drink_name, status, kitchen_station, kitchen_station_id FROM order_items ORDER BY id DESC LIMIT 20');
  console.log("\n=== RECENT ORDER ITEMS ===");
  console.table(itemsRes.rows);

  await client.end();
}

run().catch(console.error);
