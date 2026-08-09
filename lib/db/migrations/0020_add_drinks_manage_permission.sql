-- Migration to seed 'drinks:manage' permission into permissions and role_permissions tables
INSERT INTO "permissions" ("key", "description")
VALUES ('drinks:manage', 'Manage branch and partner drink availability')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "role_permissions" ("role_key", "permission_key")
VALUES ('admin', 'drinks:manage')
ON CONFLICT DO NOTHING;
