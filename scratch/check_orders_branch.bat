@echo off
set DATABASE_URL=postgresql://postgres:mero1901@localhost:5432/spacca_loc
psql %DATABASE_URL% -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'branch_id'"
