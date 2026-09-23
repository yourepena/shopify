import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { InMemoryItemStore } from "../src/store/itemStore.js";

describe("items API", () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    // Fresh store per test so cases never leak into each other.
    app = createApp({ store: new InMemoryItemStore() });
  });

  it("starts empty", async () => {
    const res = await request(app).get("/items").expect(200);
    expect(res.body).toEqual([]);
  });

  it("creates an item and returns it", async () => {
    const created = await request(app)
      .post("/items")
      .send({ name: "Widget", quantity: 3 })
      .expect(201);

    expect(created.body).toMatchObject({ name: "Widget", quantity: 3 });
    expect(created.body.id).toEqual(expect.any(String));

    const fetched = await request(app).get(`/items/${created.body.id}`).expect(200);
    expect(fetched.body).toEqual(created.body);
  });

  it("defaults quantity to 0", async () => {
    const res = await request(app).post("/items").send({ name: "Widget" }).expect(201);
    expect(res.body.quantity).toBe(0);
  });

  it("rejects an invalid payload with 400 and field details", async () => {
    const res = await request(app).post("/items").send({ name: "" }).expect(400);
    expect(res.body.details).toContainEqual({ path: "name", message: "name is required" });
  });

  it("patches only the supplied fields", async () => {
    const { body: item } = await request(app)
      .post("/items")
      .send({ name: "Widget", quantity: 3 });

    const res = await request(app)
      .patch(`/items/${item.id}`)
      .send({ quantity: 10 })
      .expect(200);

    expect(res.body).toMatchObject({ name: "Widget", quantity: 10 });
  });

  it("deletes an item", async () => {
    const { body: item } = await request(app).post("/items").send({ name: "Widget" });

    await request(app).delete(`/items/${item.id}`).expect(204);
    await request(app).get(`/items/${item.id}`).expect(404);
  });

  it("404s on an unknown id and an unknown route", async () => {
    await request(app).get("/items/does-not-exist").expect(404);
    await request(app).get("/nope").expect(404);
  });
});
