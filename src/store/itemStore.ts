import { randomUUID } from "node:crypto";

export interface Item {
  id: string;
  name: string;
  quantity: number;
  createdAt: string;
}

export type NewItem = Omit<Item, "id" | "createdAt">;

/**
 * Storage seam. Swap the in-memory implementation for a DB-backed one
 * without touching the routes.
 */
export interface ItemStore {
  list(): Item[];
  get(id: string): Item | undefined;
  create(input: NewItem): Item;
  update(id: string, patch: Partial<NewItem>): Item | undefined;
  remove(id: string): boolean;
}

export class InMemoryItemStore implements ItemStore {
  private readonly items = new Map<string, Item>();

  list(): Item[] {
    return [...this.items.values()];
  }

  get(id: string): Item | undefined {
    return this.items.get(id);
  }

  create(input: NewItem): Item {
    const item: Item = { id: randomUUID(), createdAt: new Date().toISOString(), ...input };
    this.items.set(item.id, item);
    return item;
  }

  update(id: string, patch: Partial<NewItem>): Item | undefined {
    const existing = this.items.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...patch };
    this.items.set(id, updated);
    return updated;
  }

  remove(id: string): boolean {
    return this.items.delete(id);
  }
}
