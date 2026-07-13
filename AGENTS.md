# homeFood — Monorepo Guide

Two standalone projects in one directory (no workspace tool). Each has its own `package.json`, `node_modules/`, and config.

```
homeFood/           → Expo 53 + React Native 0.79 (frontend)
homeFoodBackend/    → Express 5 + TypeScript (backend)
```

---

## Frontend — `homeFood/`

See `homeFood/AGENTS.md` for full details. Key facts:

- `npm start` — dev server (`npx expo start`)
- `npm run lint` — only quality gate; no typecheck or test scripts
- `npm run reset-project` — wipes `app/` to blank
- `@/*` path alias maps to project root; `tsconfig.json` extends `expo/tsconfig.base`
- Only 2 fonts loaded: `AvenirLTProBlack` + `AvenirLTProBook`
- Styling is mixed: some files use `StyleSheet.create`, others use `tw` from `src/lib/tailwind`
- Custom Tailwind colors (`primary: #F36C26`, etc.) defined in `tailwind.config.ts`

---

## Backend — `homeFoodBackend/`

**Stack:** Express 5, TypeScript (strict), Mongoose 9, Zod validation, JWT auth, bcrypt, EventEmitter for event hooks.  
**Entry:** `src/server.ts` → imports `src/app.ts` (Express app setup).  
**Dev command:** `npm run dev` (runs `nodemon` → `ts-node src/server.ts`).  
**Build:** `npm run build` → `tsc` outputs to `dist/`.  
**Start (prod):** `npm start` → `node dist/server.js`.  
**No test, lint, or typecheck scripts exist.**  

### Architecture

- `src/config/env.ts` — loads `.env` via dotenv; defaults: PORT=8080, MONGO_URI=mongodb://localhost:27017/homefood
- `src/app.ts` — Express app with CORS, JSON parsing, routes, and MongoDB connection
- `src/server.ts` — starts the HTTP listener
- `src/bootstrap/events.ts` — registers domain event listeners (emitted after DB connect)
- `src/config/` — `env.ts` (env vars), `db.ts` (stub), `redis.ts` (stub), `logger.ts` (stub)
- `src/middlewares/validate.ts` — Zod request validation middleware
- `src/controllers/` — legacy controllers (not used by current route modules)
- `src/model/user/` — Mongoose User model
- `src/modules/` — each domain has controller, service, repository, model, validation, routes, events

### Module pattern (see `src/modules/orders/`)

```
order.controller.ts   → HTTP handlers (parse request, call service, return response)
order.service.ts      → business logic, emits domain events
order.repository.ts   → Mongoose queries (CRUD)
order.model.ts        → Mongoose schema/model + TypeScript interface
order.validation.ts   → Zod schemas
order.routes.ts       → Express Router (mount in app.ts)
order.events.ts       → EventEmitter instance (imported by service and bootstrap/events)
```

### Routes

| Prefix | File |
|---|---|
| `/api/auth` | `src/modules/auth/auth.routes.ts` (stub — only POST /login) |
| `/api/orders` | `src/modules/orders/order.routes.ts` |

### Environment

`.env` file at `homeFoodBackend/.env` (`.env.example` is empty). Required vars:

```
PORT=8080
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/homefood
JWT_SECRET=supersecret
BCRYPT_SALT_ROUNDS=10
```

### Gotchas

- `esModuleInterop: true` + `module: CommonJS` — use default imports for CommonJS modules (e.g., `import express from "express"`)
- MongoDB connection happens at module import time in `src/app.ts` (not lazily)
- Domain events registered _after_ DB connect in `app.ts:33` — do not move before
- `dist/` is not gitignored (backend `.gitignore` is empty)
