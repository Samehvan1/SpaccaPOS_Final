const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:mero1901@localhost:5432/spacca_loc' });
const sql = `
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL PRIMARY KEY,
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
`;

pool.query(sql)
  .then(() => {
    console.log('Session table created successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed to create session table:', err);
    process.exit(1);
  });
