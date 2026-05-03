import pg from 'pg';

async function testQuery() {
    const client = new pg.Client({
        connectionString: 'postgresql://postgres:mero1901@localhost:5432/spacca_loc'
    });
    
    try {
        await client.connect();
        console.log('Connected');
        
        const branchId = 1;
        const startDate = '2026-04-03T00:00:00.000Z';
        const endDate = '2026-05-03T20:59:59.999Z';
        
        const sql = `
            select "id", "branch_id", "order_number" 
            from "orders" 
            where ("orders"."branch_id" = $1 and "orders"."created_at" >= $2 and "orders"."created_at" <= $3) 
            order by "orders"."created_at" desc
        `;
        
        const res = await client.query(sql, [branchId, startDate, endDate]);
        console.log('Success! Rows found:', res.rowCount);
        
    } catch (err) {
        console.error('Query failed:', err);
    } finally {
        await client.end();
    }
}

testQuery();
