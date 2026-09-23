import express, { type Express } from "express";
import { errorHandler, notFound } from "./lib/errors.js";
import { itemsRouter } from "./routes/items.js";
import { InMemoryItemStore, type ItemStore } from "./store/itemStore.js";

export interface AppDeps {
  store?: ItemStore;
}

/**
 * Builds the app without binding a port, so tests can drive it over
 * supertest and each test can inject a fresh store.
 */
export function createApp({ store = new InMemoryItemStore() }: AppDeps = {}): Express {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/items", itemsRouter(store));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
