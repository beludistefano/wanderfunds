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

    const createdTripID = res.body.trip.rows[0];

    const destinationIsText = await request(app).get(
      `/api/trip/${createdTripID.tripid}`
    );
    expect(destinationIsText.statusCode).toBe(200);
    expect(destinationIsText.body.length).toBe(1);
    expect(destinationIsText.body[0].destination).toBe(SQLinjection);
    expect(typeof destinationIsText.body[0].destination).toBe("string");

    const tableStillExists = await request(app).get("/api/trips");
    expect(tableStillExists.statusCode).toBe(200);
    expect(Array.isArray(tableStillExists.body)).toBe(true);

    await pool.query("DELETE FROM trips WHERE tripid = $1", [
      createdTripID.tripid,
    ]);
  });
});
