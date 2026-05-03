@echo off
set DATABASE_URL=postgresql://postgres:mero1901@localhost:5432/spacca_loc
psql %DATABASE_URL% -c "select id, branch_id, order_number from orders where branch_id = 1 and created_at >= '2026-04-03T00:00:00.000Z' and created_at <= '2026-05-03T20:59:59.999Z' order by created_at desc"
