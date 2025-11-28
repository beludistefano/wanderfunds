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

describe("GET /api/trips", () => {
  it("Returns 200 and an array of trips", async () => {
    const res = await request(app).get("/api/trips");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("GET /api/trip/:tripID", () => {
  it("Returns 500 for incorrect ID format", async () => {
    const res = await request(app).get("/api/trip/randomIDformat");

    expect(res.statusCode).toBe(500);
  });

  it("Returns 200 and empty array for non-existent trip", async () => {
    const res = await request(app).get(
      "/api/trip/8ad61e89-aa9c-40c3-bceb-4d037ef49fce"
    );

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it("Returns 200 and trip object in an array of length 1", async () => {
    const res = await request(app).get(
      "/api/trip/5ad61e89-aa9c-40c3-bceb-4d037ef49fce"
    );

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].destination).toBe("Turkey and Greece");
  });
});

describe("POST /api/trip", () => {
  it("Creates a trip and returns code 200", async () => {
    const newTrip = {
      destination: "Paris",
      description: "Vacation",
      from_date: "2026-02-01",
      to_date: "2026-02-07",
      default_split: "equal",
      status: "Planning",
      auto_add: true,
      members: 2,
    };

    const res = await request(app)
      .post("/api/trips")
      .send(newTrip)
      .set("Content-Type", "application/json");

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("tripid");
    expect(res.body.destination).toBe("Paris");
  });
});
