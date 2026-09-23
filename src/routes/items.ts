import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../lib/errors.js";
import type { ItemStore } from "../store/itemStore.js";

const newItemSchema = z.object({
  name: z.string().min(1, "name is required"),
  quantity: z.number().int().nonnegative().default(0),
});

const patchItemSchema = newItemSchema.partial();

export function itemsRouter(store: ItemStore): Router {
  const router = Router();

  router.get("/", (_req, res) => {
    res.json(store.list());
  });

  router.get("/:id", (req, res) => {
    const item = store.get(req.params.id);
    if (!item) throw new HttpError(404, `Item ${req.params.id} not found`);
    res.json(item);
  });

  router.post("/", (req, res) => {
    const input = newItemSchema.parse(req.body);
    res.status(201).json(store.create(input));
  });

  router.patch("/:id", (req, res) => {
    const patch = patchItemSchema.parse(req.body);
    const updated = store.update(req.params.id, patch);
    if (!updated) throw new HttpError(404, `Item ${req.params.id} not found`);
    res.json(updated);
  });

  router.delete("/:id", (req, res) => {
    if (!store.remove(req.params.id)) {
      throw new HttpError(404, `Item ${req.params.id} not found`);
    }
    res.status(204).end();
  });

  return router;
}
