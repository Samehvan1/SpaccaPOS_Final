import pg from 'pg';

async function run() {
  const client = new pg.Client({
    connectionString: "postgresql://postgres:postgres@localhost:5432/spacca_pos"
  });
  await client.connect();
  try {
    const res = await client.query(`
      insert into "customers" ("name", "phone", "points", "total_spent", "visit_count") 
      values ($1, $2, $3, $4, $5) 
      on conflict ("phone") 
      do update set 
        "points" = "customers"."points" + cast($6 as integer), 
        "total_spent" = "customers"."total_spent" + cast($7 as numeric), 
        "visit_count" = "customers"."visit_count" + 1, 
        "updated_at" = $8
    `, [
      "Sameh Tohamy",
      "01010647010",
      15,
      98.24561403508771,
      1,
      15,
      98.24561403508771,
      new Date()
    ]);
    console.log("Success:", res);
  } catch (e) {
    console.error("Error from PG:", e.message);
  } finally {
    await client.end();
  }
}

run();
