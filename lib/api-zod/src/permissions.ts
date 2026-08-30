export const ALL_PERMISSIONS = {
  // Admin & Security
  "admin:view": { name: "Access Admin Hub" },
  "users:view": { name: "View Users" },
  "users:create": { name: "Create Users" },
  "users:update": { name: "Update Users" },
  "users:delete": { name: "Delete Users" },
  "roles:view": { name: "View Roles" },
  "roles:manage": { name: "Manage Roles" },

  // POS, Cashier & Kitchen Operations
  "pos:view": { name: "Access POS" },
  "pos:create_order": { name: "Create Orders" },
  "pos:apply_discount": { name: "Apply Discount" },
  "kitchen:view": { name: "Access Kitchen" },
  "kitchen:mark_ready": { name: "Mark Ready" },
  "orders:pickup": { name: "Access Pickup" },

  // Cashier Operations
  "cashier:view": { name: "Cashier View" },
  "cashier:approve_order": { name: "Approve Order" },
  "cashier:cancel_order": { name: "Cancel Order" },
  "cashier:refund_order": { name: "Refund Order" },
  "cashier:close_session": { name: "Close Session" },
  "cashier:view_reports": { name: "View Cashier Reports" },

  // Catalog & Drinks
  "catalog:view": { name: "View Catalog" },
  "catalog:manage": { name: "Manage Catalog" },
  "drinks:manage": { name: "Manage Drink Availability" },

  // Inventory, Stock & Audits
  "inventory:view": { name: "View Inventory" },
  "inventory:manage": { name: "Manage Inventory" },
  "inventory:adjust": { name: "Adjust Stock" },
  "inventory:audit_approve": { name: "Approve Stock Audits" },

  // Purchases & Suppliers
  "purchases:view": { name: "View Purchases & Suppliers" },
  "purchases:manage": { name: "Manage Purchases & Suppliers" },

  // Finance, Discounts & Reports
  "reports:view": { name: "View Reports" },
  "discounts:view": { name: "View Discounts" },
  "discounts:manage": { name: "Manage Discounts" },

  // Infrastructure, Settings & Partners
  "branches:manage": { name: "Manage Branches" },
  "settings:manage": { name: "Manage Settings" },
  "partners:view": { name: "View Aggregator Partners" },
  "partners:manage": { name: "Manage Aggregator Partners" },
} as const;

export type PermissionKey = keyof typeof ALL_PERMISSIONS;
