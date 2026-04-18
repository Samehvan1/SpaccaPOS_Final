# Windows Migration Guide for Spacca POS

This guide outlines the mandatory steps to make the Spacca POS system (originally developed on Linux) work correctly in a Windows development environment.

## 1. Environment & Dependencies

### Fix PNPM Workspace Overrides
Windows often requires specific native binaries that are sometimes excluded in Linux-originated `pnpm-workspace.yaml` files.
- Open `pnpm-workspace.yaml`.
- Search for the `overrides` section.
- **Action**: Remove any overrides that specifically exclude `win32` platforms or force generic versions of `esbuild`, `rollup`, or `lightningcss`.

### Clean Install
```powershell
pnpm install
```

---

## 2. API Library Refactoring (`api-zod`)

The `api-zod` library has a naming collision between Zod schemas and TypeScript types. Windows TypeScript compiler is often stricter about this.

- Open `lib/api-zod/src/index.ts`.
- Replace the blanket `export *` with explicit imports and merged exports.
- **Example Pattern**:
  ```typescript
  import * as api from "./generated/api";
  import * as types from "./generated/types";

  export const Drink = api.Drink;
  export type Drink = types.Drink;
  // Repeat for all conflicting models
  ```

---

## 3. Backend Fixes (`api-server`)

### Express Session Casting
Windows build for the API server often fails due to strict null checks on the session object.
- In routes (e.g., `auth.ts`, `ingredients.ts`), locate `req.session as Record<string, unknown>`.
- **Action**: Add an intermediate `unknown` cast: `(req.session as unknown as Record<string, unknown>)`.

### Environment Variable Loading
The API server often runs in a context where the root `.env` is not automatically loaded.
- Run: `pnpm --filter @workspace/api-server add dotenv`
- Update `artifacts/api-server/src/index.ts`:
  ```typescript
  import "dotenv/config";
  import path from "path";
  import { fileURLToPath } from "url";
  import { config } from "dotenv";

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  config({ path: path.resolve(__dirname, "../../../.env") });
  ```

### Windows Scripts
Update `artifacts/api-server/package.json` and `artifacts/spacca-pos/package.json`.
- Replace `export` with `SET`.
- Ensure `PORT` and `BASE_PATH` are explicitly set.
- **API Server Script Example**: `"dev": "SET NODE_ENV=development && SET PORT=8080 && pnpm run build && pnpm run start"`
- **Frontend Script Example**: `"dev": "SET PORT=5000 && SET BASE_PATH=/ && vite --config vite.config.ts --host 0.0.0.0"`

---

## 4. Database Setup

Standardize on `spacca_local` for Windows development to avoid permission or collision issues with system-wide defaults.

- Root `.env`:
  ```text
  DATABASE_URL=postgresql://<user>:<password>@localhost:5432/spacca_local
  ```
- Initialize:
  ```powershell
  pnpm --filter @workspace/db run push
  pnpm --filter @workspace/api-server run start # To trigger initial seed
  ```

---

## 5. API Client Synchronization

If you update the `openapi.yaml`, always run:
```powershell
pnpm --filter @workspace/api-spec run codegen
```
Then remember to update the manual exports in `lib/api-zod/src/index.ts` if new models are added.
