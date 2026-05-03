@echo off
set DATABASE_URL=postgresql://postgres:mero1901@localhost:5432/spacca_loc
psql %DATABASE_URL% -c "select \"id\", \"branch_id\", \"order_number\" from \"orders\" where (\"orders\".\"branch_id\" = 1)"
