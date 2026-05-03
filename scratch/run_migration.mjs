import pg from 'pg';
import fs from 'fs';

async function run() {
    const client = new pg.Client({
        connectionString: 'postgresql://postgres:mero1901@localhost:5432/spacca_loc'
    });
    
    try {
        await client.connect();
        console.log('Connected to database');
        
        const sql = fs.readFileSync('scratch/manual_migration.sql', 'utf8');
        await client.query(sql);
        console.log('Migration completed successfully');
        
        const res = await client.query('SELECT name FROM branches');
        console.log('Branches:', res.rows);
        
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

run();
