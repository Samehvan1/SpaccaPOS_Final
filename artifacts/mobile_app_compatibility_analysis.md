# SpaccaPOS Mobile App Integration & Compatibility Analysis

This report evaluates the compatibility between the Android Application (`AndroidApp/spacca-android-`) and the current SpaccaPOS Backend System (`SpaccaPos/artifacts/api-server`). It outlines the architectural differences, maps the API endpoints and logic, identifies missing parts, and proposes a clear integration strategy to align both systems.

---

## 1. Architectural & Protocol Differences

The two codebases were designed with fundamentally different e-commerce paradigms:

| Dimension | Android Application (`spacca-android-`) | SpaccaPOS Backend (`api-server`) |
| :--- | :--- | :--- |
| **Paradigm** | **Stateful Session / Cart-Driven** (Magento/Bagisto style) | **Stateless Checkout / Pos-Driven** (Barista-driven POS) |
| **Cart Storage** | Stored on the Server (Session/Token bound quote) | Stored on the Client (Stateless till POS submission) |
| **Customizations** | **Catalog-Variant-Driven**: Customization attributes are resolved to a concrete variant product (`variantId`) before adding to the cart. | **Dynamic Slot-Driven**: Customizations (milk, size, coffee type) are dynamic slots with modifiers, stored on-the-fly inside order item records. |
| **Order Placement** | Simple request to `checkout/onepage/orders` containing only a comment. Cart contents are retrieved and converted to an order on the server. | Complex POST request to `/orders` containing all items, quantities, price calculations, and item customizations. |
| **Network Client** | Kotlin / Ktor Client | Node.js / Express.js |

---

## 2. API Endpoint Mapping

The Android App expects a set of endpoints mimicking Magento/Bagisto REST APIs. The current SpaccaPOS backend contains none of these, only supporting POS-specific routes.

Below is the mapping showing how mobile requests align with the existing database schema:

| Mobile Endpoint (Ktor Api) | Method | Backend Purpose | Drizzle Schema Equivalents | Status in `api-server` |
| :--- | :--- | :--- | :--- | :--- |
| `getAllCategories` | GET | Retrieve nested drink categories | `drinkCategoriesTable` | **Missing** (POS uses `/drink-categories` which is a flat list) |
| `products/getProductsByCategory` | GET | Paginated list of products for a category | `drinksTable` | **Missing** (POS uses `/drinks` with query params) |
| `products/:id` | GET | Fetch single product details | `drinksTable`, `drinkIngredientSlotsTable` | **Missing** (POS uses `/drinks/:id` with template/volume overrides) |
| `products/getAvailableOptions` | POST | Filter available customization IDs | `drinkSlotTypeOptionsTable`, `drinkSlotVolumesTable` | **Missing** |
| `products/getProductIdByOptions` | POST | Resolve attributes selection to a child product ID | `drinksTable` (Variants logic) | **Missing** (POS has no concept of pre-generated variant IDs) |
| `checkout/cart` | GET | Retrieve current cart totals and items | Temporary cart session / table | **Missing** |
| `checkout/cart` | POST | Add item to cart | Temporary cart items table | **Missing** |
| `checkout/cart` | PUT | Update quantity in cart | Temporary cart items table | **Missing** |
| `checkout/cart` | DELETE | Remove item from cart | Temporary cart items table | **Missing** |
| `checkout/onepage/selectBranch` | POST | Set order branch / sales channel | `branchesTable` | **Missing** |
| `checkout/onepage/payment-methods` | POST | Set checkout payment method | `orderPaymentsTable` | **Missing** |
| `checkout/onepage/orders` | POST | Place final order | `ordersTable`, `orderItemsTable`, `orderItemCustomizationsTable` | **Missing** (POS uses `POST /orders` with full body) |
| `customer/orders` | GET | Retrieve logged-in customer's order history | `ordersTable` | **Missing** (POS uses `/orders` filtered by barista/session) |
| `customer/orders/:id` | GET | Get detailed order status | `ordersTable`, `orderItemsTable` | **Missing** |

---

## 3. Menu & Customization Logic Alignment

### How Customizations Work in Android App
1. The user selects a configurable drink (e.g. Latte).
2. The UI renders sliders or radio buttons corresponding to `SuperAttributeModel` properties (`isSlider`, `isCupSize`, `isCountable`, etc.).
3. When the user changes an option, the app sends selected option IDs to `/products/getProductIdByOptions` to fetch the concrete `variantId` (simple product representation).
4. The resolved product ID is added to the cart.

### How Customizations Work in SpaccaPOS Backend
Our system does **not** pre-generate simple variant products for every single combination of Milk (Oat/Soy/Skimmed) + Cup Size (Small/Medium/Large) + Sugar Level. Instead, we use a single drink row (`drinksTable`) linked to:
- `drinkIngredientSlotsTable` (defining custom slots like "Milk")
- `drinkSlotTypeOptionsTable` (defining options like "Oat Milk" with costs)
- `drinkSlotVolumesTable` (defining volume options)

When an order is created, selections are stored directly inside `orderItemCustomizationsTable`.

### Alignment Path
To bridge this:
1. **Mock Variant ID / Dynamic Variant Resolution**: In our bridge API, we can either:
   - Treat the parent drink ID as the base product, and encode customization choices in a stringified/hashed format returned as a mock `variantId` (e.g., `variantId = parentId_option1_option2`).
   - Parse this mock ID when the checkout cart is processed to build the proper dynamic customizations list.
2. **Expose Customizations as Super Attributes**: We can map the `drinkIngredientSlotsTable` (e.g. Milk choice) and `drinkSlotVolumesTable` into `SuperAttributeModel` and `OptionModel` expected by the Android App.

---

## 4. Proposed Integration Plan

We recommend building a **Mobile Bridge Router** inside the existing backend (`api-server`) to keep the Android App code intact and ensure clean compatibility.

### Phase 1: Read-Only Catalog API Bridge
Implement the following routes under a new Express router prefix (e.g. `/api/mobile/`):
- `GET /getAllCategories`: Queries `drinkCategoriesTable` and formats it with logo URLs and child lists.
- `GET /products/getProductsByCategory`: Maps category drinks using `/drinks?categoryId=...`.
- `GET /products/:id`: Formats `buildDrinkDetail(id)` output into the `ProductDetailsResponse` format with `superAttributes` populated from ingredient slots.

### Phase 2: Cart & Customization Resolver Bridge
Since the app expects database variant IDs and a stateful cart, we can implement a stateless session-based cart or a simple Postgres database table `carts` and `cart_items`:
- `POST /products/getProductIdByOptions`: Instead of returning a database ID, generate a encoded variant string (e.g., `12_34_56` where `12` is drink ID, and `34, 56` are option IDs). The app treats this string as the `variantId` integer or string key.
- `POST /checkout/cart`: Decode the encoded variant string back into product and option IDs, and store them in a `cart_items` database table linked to the user's session token.
- `GET /checkout/cart`: Return totals by running `calculateDrinkData` on the items currently in the cart.

### Phase 3: Checkout & Order Submission Bridge
- `POST /checkout/onepage/selectBranch`: Save branch ID to cart.
- `POST /checkout/onepage/payment-methods`: Save payment method to cart.
- `POST /checkout/onepage/orders`: Retrieve the saved cart, invoke the existing internal transactional logic from `POST /orders` (which deducts ingredients stock, awards loyalty points, writes to `ordersTable` / `orderItemsTable` / `orderItemCustomizationsTable`), and notify the kitchen stations using Server-Sent Events (SSE).

---

## 5. Summary of Actions Needed

1. **Create Mobile Bridge Router**: Create a new route file `mobile-bridge.ts` in `api-server/src/routes` and mount it under `/api/` in `index.ts`.
2. **Implement Cart Table Schema**: Add a lightweight `carts` and `cart_items` table in the database schema to track user carts.
3. **Connect to SSE**: Ensure mobile orders trigger the existing `broadcastEvent("order_created", ...)` SSE function so baristas instantly see mobile orders on their POS screens.
