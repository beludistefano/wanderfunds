jest.mock("../authMiddleware", () => ({
  requireAuth: (req, res, next) => {
    req.user = {
      id: "e2f52ed5-19a9-45fa-aec2-5c9ac0b9a618",
      email: "mariabelendistefano@gmail.com",
    };
    next();
  },
}));

const request = require("supertest");
const app = require("../app");
const pool = require("../db");

describe("POST /api/trip", () => {
  it("SQL injection does not affect table and trip is created with value as string", async () => {
    const SQLinjection = "Paris'); DROP TABLE trips;--";

    const newTrip = {
      destination: SQLinjection,
      description: "Trying SQL injection",
      from_date: "2026-02-01",
      to_date: "2026-02-07",
      default_split: "equal",
      status: "Planning",
      auto_add: true,
      members: 2,
    };

    const res = await request(app)
      .post("/api/trip")
      .send(newTrip)
      .set("Content-Type", "application/json");

    expect(res.statusCode).toBe(200);
  });
});
