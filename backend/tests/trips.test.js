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
const { randomUUID } = require("crypto");

describe("GET /api/trips", () => {
  it("Returns 200 and an array of trips", async () => {
    const res = await request(app).get("/api/trips");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("GET /api/trip/:tripID", () => {
  const tripID = randomUUID();
  const userRoleID = randomUUID();

  beforeAll(async () => {
    await pool.query(
      `INSERT INTO trips (tripID, ownerid, destination, description, from_date, to_date, default_split, status, auto_add)
      VALUES ($1, 'e2f52ed5-19a9-45fa-aec2-5c9ac0b9a618', 'Turkey and Greece', 'test', '2026-01-01', '2026-01-05', 'equal', 'Planning', true)`,
      [tripID]
    );

    await pool.query(
      `INSERT INTO user_role (userroleid, tripid, role, user_id, email_notifications)
       VALUES ($1, $2, 'Owner', 'e2f52ed5-19a9-45fa-aec2-5c9ac0b9a618', true)`,
      [userRoleID, tripID]
    );
  });

  it("Returns 500 for incorrect ID format", async () => {
    const res = await request(app).get("/api/trip/randomIDformat");

    expect(res.statusCode).toBe(500);
  });

  it("Returns 200 and empty array for non-existent trip", async () => {
    const res = await request(app).get(
      "/api/trip/9b2c8a4d-4ef7-4f89-bd71-63f9c8683bbb"
    );

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it("Returns 200 and trip object in an array of length 1", async () => {
    const res = await request(app).get(`/api/trip/${tripID}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].destination).toBe("Turkey and Greece");
  });

  afterAll(async () => {
    await pool.query("DELETE FROM user_role WHERE userroleid = $1", [
      userRoleID,
    ]);

    await pool.query("DELETE FROM trips WHERE tripid = $1", [tripID]);
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
      .post("/api/trip")
      .send(newTrip)
      .set("Content-Type", "application/json");

    expect(res.statusCode).toBe(200);
    expect(res.body.trip.rowCount).toBe(1);
    expect(res.body.role.rowCount).toBe(1);
    expect(res.body.fund.rowCount).toBe(1);

    expect(res.body.trip.rows[0]).toHaveProperty("tripid");
  });

  it("Empty destination throws error and code 400", async () => {
    const newTrip = {
      destination: "",
      description: "Vacation",
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

    expect(res.statusCode).toBe(400);
  });

  it("To date prior to from date throws error and code 400", async () => {
    const newTrip = {
      destination: "Paris",
      description: "Vacation",
      from_date: "2026-02-07",
      to_date: "2026-02-01",
      default_split: "equal",
      status: "Planning",
      auto_add: true,
      members: 2,
    };

    const res = await request(app)
      .post("/api/trip")
      .send(newTrip)
      .set("Content-Type", "application/json");

    expect(res.statusCode).toBe(400);
  });

  it("Status not in DB check will throw an error and status code 400", async () => {
    const newTrip = {
      destination: "Paris",
      description: "Vacation",
      from_date: "2026-02-01",
      to_date: "2026-02-07",
      default_split: "equal",
      status: "Random status",
      auto_add: true,
      members: 2,
    };

    const res = await request(app)
      .post("/api/trip")
      .send(newTrip)
      .set("Content-Type", "application/json");

    expect(res.statusCode).toBe(400);
  });
});

describe("PUT /api/trip", () => {
  var tripID = randomUUID();

  beforeAll(async () => {
    await pool.query(
      `INSERT INTO trips (tripID, ownerid, destination, description, from_date, to_date, default_split, status, auto_add)
      VALUES ($1, 'e2f52ed5-19a9-45fa-aec2-5c9ac0b9a618', 'Turkey and Greece', 'test', '2026-01-01', '2026-01-05', 'equal', 'Planning', true)`,
      [tripID]
    );
  });

  it("Empty destination update throws error and code 400", async () => {
    const updateTrip = {
      tripID: tripID,
      destination: "",
      description: "Vacation",
      from_date: "2026-02-01",
      to_date: "2026-02-07",
      default_split: "equal",
      status: "Planning",
      auto_add: true,
      members: 2,
      trip_header_url: "www.test.com",
    };

    const res = await request(app)
      .put("/api/trip")
      .send(updateTrip)
      .set("Content-Type", "application/json");

    expect(res.statusCode).toBe(400);
  });

  it("To date prior to from date throws error and code 400", async () => {
    const updateTrip = {
      tripID: tripID,
      destination: "Paris",
      description: "Vacation",
      from_date: "2026-02-07",
      to_date: "2026-02-01",
      default_split: "equal",
      status: "Planning",
      auto_add: true,
      members: 2,
      trip_header_url: "www.test.com",
    };

    const res = await request(app)
      .put("/api/trip")
      .send(updateTrip)
      .set("Content-Type", "application/json");

    expect(res.statusCode).toBe(400);
  });

  it("Happy path trip update updates trip and returns 200 code", async () => {
    const updateTrip = {
      tripID: tripID,
      destination: "Bahamas",
      description: "Vacation",
      from_date: "2026-02-01",
      to_date: "2026-02-02",
      default_split: "equal",
      status: "Confirmed",
      auto_add: true,
      members: 2,
      trip_header_url: "www.test.com",
    };

    const res = await request(app)
      .put("/api/trip")
      .send(updateTrip)
      .set("Content-Type", "application/json");

    expect(res.statusCode).toBe(200);
    expect(res.body.rowCount).toBe(1);
  });

  afterAll(async () => {
    await pool.query("DELETE FROM trips WHERE tripid = $1", [tripID]);
  });
});
