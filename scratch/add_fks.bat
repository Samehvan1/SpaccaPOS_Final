@echo off
set DATABASE_URL=postgresql://postgres:mero1901@localhost:5432/spacca_loc
psql %DATABASE_URL% -c "ALTER TABLE orders ADD CONSTRAINT orders_branch_id_branches_id_fk FOREIGN KEY (branch_id) REFERENCES branches(id);"
psql %DATABASE_URL% -c "ALTER TABLE stock_audits ADD CONSTRAINT stock_audits_branch_id_branches_id_fk FOREIGN KEY (branch_id) REFERENCES branches(id);"
psql %DATABASE_URL% -c "ALTER TABLE users ADD CONSTRAINT users_branch_id_branches_id_fk FOREIGN KEY (branch_id) REFERENCES branches(id);"
