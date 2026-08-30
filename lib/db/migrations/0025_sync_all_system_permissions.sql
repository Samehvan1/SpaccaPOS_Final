-- Migration 0025: Sync and Register All System Permissions in DB

-- 1. Ensure Standard Roles exist in roles table
INSERT INTO "roles" ("key", "name", "description") VALUES
  ('admin', 'Administrator', 'Full system access'),
  ('cashier', 'Cashier', 'POS and checkout management'),
  ('barista', 'Barista', 'Kitchen and order preparation'),
  ('finance', 'Finance Manager', 'Financial and inventory reporting')
ON CONFLICT ("key") DO UPDATE SET "name" = EXCLUDED."name";

-- 2. Upsert All System Permissions
INSERT INTO "permissions" ("key", "description") VALUES
  ('admin:view', 'Access the administrative dashboard'),
  ('users:view', 'List and view user details'),
  ('users:create', 'Add new staff members'),
  ('users:update', 'Edit staff details and permissions'),
  ('users:delete', 'Remove staff members'),
  ('roles:view', 'List and view role details'),
  ('roles:manage', 'Create, update and delete roles'),
  ('pos:view', 'Open the Point of Sale terminal'),
  ('pos:create_order', 'Place new orders in the system'),
  ('pos:apply_discount', 'Apply manual or coupon discounts to orders'),
  ('kitchen:view', 'View and manage the kitchen production queue'),
  ('kitchen:mark_ready', 'Mark order items as ready for pickup'),
  ('orders:pickup', 'Open and manage pickup order queue'),
  ('cashier:view', 'Access the cashier dashboard and order list'),
  ('cashier:approve_order', 'Finalize and approve orders for payment'),
  ('cashier:cancel_order', 'Void or cancel pending orders'),
  ('cashier:refund_order', 'Process refunds for completed orders'),
  ('cashier:close_session', 'End a cashier shift and close the session'),
  ('cashier:view_reports', 'View shift summaries and performance'),
  ('catalog:view', 'Browse drinks and categories'),
  ('catalog:manage', 'Create and edit drinks and categories'),
  ('drinks:manage', 'Manage branch and partner drink availability'),
  ('inventory:view', 'Check stock levels and ingredients'),
  ('inventory:manage', 'Update stock levels, conversions and ingredient options'),
  ('inventory:adjust', 'Restock and adjust inventory quantities'),
  ('inventory:audit_approve', 'Approve or reject stock audit reports and adjust stock levels'),
  ('purchases:view', 'View purchases department, orders and suppliers'),
  ('purchases:manage', 'Create purchase orders, receive orders, and record payments'),
  ('reports:view', 'Access sales and performance reports'),
  ('discounts:view', 'View active discount codes'),
  ('discounts:manage', 'Create and edit discount codes'),
  ('branches:manage', 'Add and edit branch locations'),
  ('settings:manage', 'Change system-wide configurations'),
  ('partners:view', 'List and view aggregator partner platforms'),
  ('partners:manage', 'Create, edit and delete aggregator partner platforms')
ON CONFLICT ("key") DO UPDATE SET "description" = EXCLUDED."description";

-- 3. Seed Default Permissions for Standard Roles
-- Admin gets all permissions
INSERT INTO "role_permissions" ("role_key", "permission_key")
SELECT 'admin', p."key" FROM "permissions" p
WHERE NOT EXISTS (
  SELECT 1 FROM "role_permissions" rp WHERE rp."role_key" = 'admin' AND rp."permission_key" = p."key"
);

-- Cashier defaults
INSERT INTO "role_permissions" ("role_key", "permission_key")
SELECT v.role_key, v.permission_key
FROM (VALUES
  ('cashier', 'pos:view'),
  ('cashier', 'pos:create_order'),
  ('cashier', 'cashier:view'),
  ('cashier', 'cashier:approve_order'),
  ('cashier', 'cashier:cancel_order'),
  ('cashier', 'cashier:refund_order'),
  ('cashier', 'cashier:close_session'),
  ('cashier', 'cashier:view_reports'),
  ('cashier', 'pos:apply_discount'),
  ('cashier', 'catalog:view'),
  ('cashier', 'inventory:view'),
  ('cashier', 'partners:view')
) AS v(role_key, permission_key)
WHERE NOT EXISTS (
  SELECT 1 FROM "role_permissions" rp WHERE rp."role_key" = v.role_key AND rp."permission_key" = v.permission_key
);

-- Barista defaults
INSERT INTO "role_permissions" ("role_key", "permission_key")
SELECT v.role_key, v.permission_key
FROM (VALUES
  ('barista', 'pos:view'),
  ('barista', 'kitchen:view'),
  ('barista', 'kitchen:mark_ready'),
  ('barista', 'catalog:view'),
  ('barista', 'inventory:view')
) AS v(role_key, permission_key)
WHERE NOT EXISTS (
  SELECT 1 FROM "role_permissions" rp WHERE rp."role_key" = v.role_key AND rp."permission_key" = v.permission_key
);

-- Finance defaults
INSERT INTO "role_permissions" ("role_key", "permission_key")
SELECT v.role_key, v.permission_key
FROM (VALUES
  ('finance', 'admin:view'),
  ('finance', 'reports:view'),
  ('finance', 'inventory:view'),
  ('finance', 'cashier:view_reports'),
  ('finance', 'purchases:view')
) AS v(role_key, permission_key)
WHERE NOT EXISTS (
  SELECT 1 FROM "role_permissions" rp WHERE rp."role_key" = v.role_key AND rp."permission_key" = v.permission_key
);
