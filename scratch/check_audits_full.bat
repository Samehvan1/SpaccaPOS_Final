@echo off
set DATABASE_URL=postgresql://postgres:mero1901@localhost:5432/spacca_loc
psql %DATABASE_URL% -c "\d stock_audits"
