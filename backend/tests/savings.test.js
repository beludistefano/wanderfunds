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

const userID = "e2f52ed5-19a9-45fa-aec2-5c9ac0b9a618";

describe("GET /api/savings", () => {
  const tripID = randomUUID();
  const userRoleID = randomUUID();
  const savingsFundID = randomUUID();

  beforeAll(async () => {
    await pool.query(
      `INSERT INTO trips (tripid, ownerid, description, destination, from_date, to_date, status, default_split, auto_add, members, trip_header_url)
     VALUES ($1, $2, 'Test trip', 'Test Destination', '2026-03-01', '2026-03-10', 'Planning', 'equal', true, 2, NULL)`,
      [tripID, userID]
    );

    await pool.query(
      `INSERT INTO user_role (userroleid, tripid, role, user_id, email_notifications)
      VALUES ($1, $2, 'Owner', $3, true)`,
      [userRoleID, tripID, userID]
    );

    await pool.query(
      `INSERT INTO savings_funds (savings_funds_id, trip_id, owner_id, amount)
     VALUES ($1, $2, $3, 0)`,
      [savingsFundID, tripID, userID]
    );
  });

  it("Valid trip ID returns a savings fund", async () => {
    const res = await request(app).get(`/api/savings?tripId=${tripID}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("No trip ID returns a status code of 400", async () => {
    const res = await request(app).get("/api/savings?tripId=");

    expect(res.statusCode).toBe(400);
  });

  afterAll(async () => {
    await pool.query("DELETE FROM savings_funds WHERE savings_funds_id = $1", [
      savingsFundID,
    ]);

    await pool.query("DELETE FROM user_role WHERE userroleid = $1", [
      userRoleID,
    ]);

    await pool.query("DELETE FROM trips WHERE tripid = $1", [tripID]);
  });
});

describe("PUT /api/trip/savings", () => {
  const tripID = randomUUID();
  const userRoleID = randomUUID();
  const savingsFundID = randomUUID();

  beforeAll(async () => {
    await pool.query(
      `INSERT INTO trips (tripid, ownerid, description, destination, from_date, to_date, status, default_split, auto_add, members, trip_header_url)
     VALUES ($1, $2, 'Test trip', 'Test Destination', '2026-03-01', '2026-03-10', 'Planning', 'equal', true, 2, NULL)`,
      [tripID, userID]
    );

    await pool.query(
      `INSERT INTO user_role (userroleid, tripid, role, user_id, email_notifications)
      VALUES ($1, $2, 'Owner', $3, true)`,
      [userRoleID, tripID, userID]
    );

    await pool.query(
      `INSERT INTO savings_funds (savings_funds_id, trip_id, owner_id, amount)
     VALUES ($1, $2, $3, 500)`,
      [savingsFundID, tripID, userID]
    );
  });

  it("Valid positive values update savings fund", async () => {
    const updateFunds = {
      savingsFundID: savingsFundID,
      amount: 500,
      newAmount: 100,
    };

    const res = await request(app)
      .put("/api/trip/savings")
      .send(updateFunds)
      .set("Content-Type", "application/json");

    expect(res.statusCode).toBe(200);
    expect(res.body.expenseUpdate.rows[0].amount).toBe("600");
  });

  it("Value of 0 returns error", async () => {
    const updateFunds = {
      savingsFundID: savingsFundID,
      amount: 500,
      newAmount: 0,
    };

    const res = await request(app)
      .put("/api/trip/savings")
      .send(updateFunds)
      .set("Content-Type", "application/json");

    expect(res.statusCode).toBe(400);
  });

  it("Negative value subtracts funds", async () => {
    const updateFunds = {
      savingsFundID: savingsFundID,
      amount: 500,
      newAmount: -200,
    };

    const res = await request(app)
      .put("/api/trip/savings")
      .send(updateFunds)
      .set("Content-Type", "application/json");

    expect(res.statusCode).toBe(200);
    expect(res.body.expenseUpdate.rows[0].amount).toBe("300");
  });

  afterAll(async () => {
    await pool.query("DELETE FROM savings_funds WHERE savings_funds_id = $1", [
      savingsFundID,
    ]);

    await pool.query("DELETE FROM user_role WHERE userroleid = $1", [
      userRoleID,
    ]);

    await pool.query("DELETE FROM trips WHERE tripid = $1", [tripID]);
  });
});
