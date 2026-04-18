# Implementation Plan - Dynamic Categories, Image Uploads, and Sorting

The objective is to modernize the drink management system by replacing static hardcoded categories with a dynamic CRUD system, implementing image upload capabilities for products, and allowing manual sorting of drinks on the POS screen.

## User Review Required

> [!IMPORTANT]
> **Database Changes**: I will be adding a NEW `drink_categories` table and updating the `drinks` table to use a foreign key (`categoryId`). I will also add a `sort_order` column to the `drinks` table.

> [!WARNING]
> **Image Storage**: I will implement local storage in an `uploads/` directory on the server. If this project will be deployed to a serverless or ephemeral environment (like Vercel), we might need to consider an external storage provider (e.g., Cloudinary/S3) later.

## Proposed Changes

### Database Schema

#### [MODIFY] [drinks.ts](file:///d:/MyWorks/SpaccaTests/SpaccaPos20260416_0/SpaccaPos/lib/db/src/schema/drinks.ts)
- **[NEW] `drinkCategoriesTable`**: `id`, `name`, `sortOrder`, `isActive`.
- **[MODIFY] `drinksTable`**: 
    - Add `categoryId` integer referencing `drink_categories.id`.
    - Add `sortOrder` integer (default 0).

---

### Backend (API Server)

#### [MODIFY] [app.ts](file:///d:/MyWorks/SpaccaTests/SpaccaPos20260416_0/SpaccaPos/artifacts/api-server/src/app.ts)
- Add static file serving: `app.use("/uploads", express.static("uploads"))`.

#### [NEW] [drink-categories.ts](file:///d:/MyWorks/SpaccaTests/SpaccaPos20260416_0/SpaccaPos/artifacts/api-server/src/routes/drink-categories.ts)
- Implement GET (list), POST (create), PATCH (update), DELETE endpoints for drink categories.

#### [MODIFY] [drinks.ts](file:///d:/MyWorks/SpaccaTests/SpaccaPos20260416_0/SpaccaPos/artifacts/api-server/src/routes/drinks.ts)
- Update `GET /drinks` to sort by `category.sortOrder` then `drink.sortOrder`.
- Update `POST`/`PATCH` to handle `categoryId` and `sortOrder`.
- Implement `/api/drinks/:id/image` endpoint to handle multipart/form-data image uploads.

---

### Frontend (SPACCA-POS)

#### [NEW] [categories.tsx](file:///d:/MyWorks/SpaccaTests/SpaccaPos20260416_0/SpaccaPos/artifacts/spacca-pos/src/pages/admin/categories.tsx)
- Create a Category Management page to Add/Edit/Delete drink categories.

#### [MODIFY] [drinks.tsx](file:///d:/MyWorks/SpaccaTests/SpaccaPos20260416_0/SpaccaPos/artifacts/spacca-pos/src/pages/admin/drinks.tsx)
- Replace hardcoded `CATEGORIES` array with a dynamic fetch from the new API.
- Add an Image Upload UI in the Drink Edit dialog.
- Add a `Sort Order` numeric input.

#### [MODIFY] [pos.tsx](file:///d:/MyWorks/SpaccaTests/SpaccaPos20260416_0/SpaccaPos/artifacts/spacca-pos/src/pages/pos.tsx)
- Update `DrinkCard` to display the drink's image if `imageUrl` is present.
- Ensure the drinks grid respects the manual `sortOrder`.
- Use the new dynamic categories for the top navigation bar.

---

### [NEW] Migration Script
- **[NEW] `migrate_categories.ts`**: Extract current strings from `drinks.category`, create entries in `drink_categories`, and link existing drinks.

## Verification Plan

### Automated Verification
- Run the migration script and verify database integrity.
- Use the browser tool to test:
    - Creating a new category.
    - Assigning a drink to that category.
    - Uploading an image and verifying it appears in the POS.
    - Changing sort order and verifying it reflects in the POS.

### Manual Verification
- Verify that edited drinks no longer "jump" to the end of the list if a specific sort order is assigned.
