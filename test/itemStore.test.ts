import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryItemStore } from "../src/store/itemStore.js";

describe("InMemoryItemStore", () => {
  let store: InMemoryItemStore;

  beforeEach(() => {
    store = new InMemoryItemStore();
  });

  it("returns undefined for a missing item", () => {
    expect(store.get("missing")).toBeUndefined();
  });

  it("assigns a unique id to each item", () => {
    const a = store.create({ name: "A", quantity: 1 });
    const b = store.create({ name: "B", quantity: 1 });
    expect(a.id).not.toBe(b.id);
  });

  it("reports whether a removal happened", () => {
    const item = store.create({ name: "A", quantity: 1 });
    expect(store.remove(item.id)).toBe(true);
    expect(store.remove(item.id)).toBe(false);
  });
});
