# Pairing scaffold

TypeScript + Express 5 REST API, ready for a pair-programming session.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Server on :3000, restarts on save |
| `npm test` | Run the suite once |
| `npm run test:watch` | Watch mode — leave this running while pairing |
| `npm run typecheck` | Types only, no emit |
| `npm run cli -- add --name Widget --quantity 3` | Run the CLI |

## Layout

```
src/
  app.ts              createApp() — builds the app, binds no port (testable)
  server.ts           entry point: listen
  cli.ts              CLI via node:util parseArgs (no dependency)
  routes/items.ts     example resource: validation + handlers
  store/itemStore.ts  ItemStore interface + in-memory implementation
  lib/errors.ts       HttpError + the single JSON error handler
test/
  items.api.test.ts   HTTP-level tests through supertest
  itemStore.test.ts   unit tests for the store
```

## Why it's shaped this way

- **`createApp()` returns the app without listening.** Tests drive it through supertest
  with no ports and no teardown, and each test injects a fresh store.
- **`ItemStore` is an interface.** Swapping in a real database never touches a route.
- **One error handler.** Handlers `throw`; Express 5 forwards rejections from async
  handlers automatically. Zod errors become 400s with field details, `HttpError`
  carries its own status, anything else is a 500.

## Adding a resource

1. `src/store/<thing>Store.ts` — interface + in-memory impl
2. `src/routes/<thing>.ts` — `export function <thing>Router(store)` with a Zod schema
3. `app.use("/<thing>", <thing>Router(store))` in `app.ts`
4. Copy `test/items.api.test.ts` as the starting point

## Sanity check

```
curl localhost:3000/health
curl -X POST localhost:3000/items -H 'content-type: application/json' -d '{"name":"Widget","quantity":3}'
```
