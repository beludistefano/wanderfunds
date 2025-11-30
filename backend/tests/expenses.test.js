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

describe("GET /api/expenses", () => {
  const tripID = randomUUID();
  const oneExpenseID = randomUUID();
  const secExpenseID = randomUUID();

  beforeAll(async () => {
    await pool.query(
      `INSERT INTO trips (tripid, ownerid, description, destination, from_date, to_date, status, default_split, auto_add, created_at, members)
     VALUES ($1, $2, 'Seed trip', 'Test Destination', '2026-01-01', '2026-01-10', 'Planning', 'equal', true, NOW(), 2)`,
      [tripID, userID]
    );

    await pool.query(
      `INSERT INTO expected_expenses (
        expense_id, trip_id, owner_id, name, amount, expected_date, expense_status, split, confirmed, confirmed_date
      ) VALUES
        ($1, $2, $3, 'Flight', 1200.00, NULL, 'accepted', 'shared', false, NULL),
        ($4, $2, $3, 'Hotel', 800.00, NULL, 'accepted', 'shared', true, '2025-12-12')`,
      [oneExpenseID, tripID, userID, secExpenseID]
    );
  });

  it("Valid trip ID returns an array; if expenses exist, the array contains expenses", async () => {
    const res = await request(app).get(`/api/expenses?tripId=${tripID}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("No trip ID returns a status code of 400", async () => {
    const res = await request(app).get("/api/expenses?tripId=");

    expect(res.statusCode).toBe(400);
  });

  afterAll(async () => {
    await pool.query(
      `DELETE FROM expected_expenses
      WHERE trip_id =$1`,
      [tripID]
    );

    await pool.query(
      `DELETE FROM trips
     WHERE tripid = $1`,
      [tripID]
    );
  });
});

describe("GET /api/confirmed-expenses", () => {
  const tripID = randomUUID();
  const oneExpenseID = randomUUID();
  const secExpenseID = randomUUID();

  beforeAll(async () => {
    await pool.query(
      `INSERT INTO trips (tripid, ownerid, description, destination, from_date, to_date, status, default_split, auto_add, created_at, members)
     VALUES ($1, $2, 'Seed trip', 'Test Destination', '2026-01-01', '2026-01-10', 'Planning', 'equal', true, NOW(), 2)`,
      [tripID, userID]
    );

    await pool.query(
      `INSERT INTO expected_expenses (
        expense_id, trip_id, owner_id, name, amount, expected_date, expense_status, split, confirmed, confirmed_date
      ) VALUES
        ($1, $2, $3, 'Flight', 1200.00, NULL, 'accepted', 'shared', false, NULL),
        ($4, $2, $3, 'Hotel', 800.00, NULL, 'accepted', 'shared', true, '2025-12-12')`,
      [oneExpenseID, tripID, userID, secExpenseID]
    );
  });

  it("Valid trip ID returns an array", async () => {
    const res = await request(app).get(
      `/api/confirmed-expenses?tripId=${tripID}`
    );

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("No trip ID returns a status code of 400", async () => {
    const res = await request(app).get("/api/confirmed-expenses?tripId=");

    expect(res.statusCode).toBe(400);
  });

  it("All of the expenses returned are confirmed", async () => {
    const res = await request(app).get(
      `/api/confirmed-expenses?tripId=${tripID}`
    );

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const allConfirmed = res.body.every(
      (expense) => expense.confirmed === true
    );

    expect(allConfirmed).toBe(true);
  });

  afterAll(async () => {
    await pool.query(
      `DELETE FROM expected_expenses
      WHERE trip_id =$1`,
      [tripID]
    );

    await pool.query(
      `DELETE FROM trips
     WHERE tripid = $1`,
      [tripID]
    );
  });
});

describe("POST /api/expenses", () => {
  const tripID = randomUUID();

  beforeAll(async () => {
    await pool.query(
      `INSERT INTO trips (tripid, ownerid, description, destination, from_date, to_date, status, default_split, auto_add, created_at, members)
     VALUES ($1, $2, 'Seed trip', 'Test Destination', '2026-01-01', '2026-01-10', 'Planning', 'equal', true, NOW(), 2)`,
      [tripID, userID]
    );
  });

  it("Creates an expense and returns code 200", async () => {
    const newExpense = {
      tripID: tripID,
      name: "Hotel",
      amount: 200,
      expectedDate: null,
      expenseStatus: "accepted",
      split: "shared",
    };

    const res = await request(app)
      .post("/api/expenses")
      .send(newExpense)
      .set("Content-Type", "application/json");

    expect(res.statusCode).toBe(200);
    expect(res.body.expense.rowCount).toBe(1);
  });

  it("No trip ID returns code 400", async () => {
    const newExpense = {
      tripID: "",
      name: "No trip ID expense",
      amount: 200,
      expectedDate: null,
      expenseStatus: "accepted",
      split: "shared",
    };

    const res = await request(app)
      .post("/api/expenses")
      .send(newExpense)
      .set("Content-Type", "application/json");

    expect(res.statusCode).toBe(400);
  });

  it("Invalid split string returns code 400", async () => {
    const newExpense = {
      tripID: tripID,
      name: "Invalid Split",
      amount: 200,
      expectedDate: null,
      expenseStatus: "accepted",
      split: "invalid",
    };

    const res = await request(app)
      .post("/api/expenses")
      .send(newExpense)
      .set("Content-Type", "application/json");

    expect(res.statusCode).toBe(400);
  });

  afterAll(async () => {
    await pool.query(
      `DELETE FROM expected_expenses
      WHERE trip_id =$1`,
      [tripID]
    );

    await pool.query(
      `DELETE FROM trips
     WHERE tripid = $1`,
      [tripID]
    );
  });
});

describe("POST /api/confirmed-expenses", () => {
  const tripID = randomUUID();

  beforeAll(async () => {
    await pool.query(
      `INSERT INTO trips (tripid, ownerid, description, destination, from_date, to_date, status, default_split, auto_add, created_at, members)
     VALUES ($1, $2, 'Seed trip', 'Test Destination', '2026-01-01', '2026-01-10', 'Planning', 'equal', true, NOW(), 2)`,
      [tripID, userID]
    );
  });

  it("Creates an expense and returns code 200", async () => {
    const newExpense = {
      tripID: tripID,
      name: "Hotel",
      amount: 200,
      expectedDate: null,
      confirmedDate: "2025-07-02",
      expenseStatus: "accepted",
      split: "shared",
      members: "2",
    };

    const res = await request(app)
      .post("/api/confirmed-expenses")
      .send(newExpense)
      .set("Content-Type", "application/json");

    expect(res.statusCode).toBe(200);
    expect(res.body.expense.rowCount).toBe(1);
  });

  it("No confirmed date returns code 400", async () => {
    const newExpense = {
      tripID: tripID,
      name: "Hotel",
      amount: 200,
      expectedDate: null,
      confirmedDate: "",
      expenseStatus: "accepted",
      split: "shared",
      members: "2",
    };

    const res = await request(app)
      .post("/api/confirmed-expenses")
      .send(newExpense)
      .set("Content-Type", "application/json");

    expect(res.statusCode).toBe(400);
  });

  afterAll(async () => {
    await pool.query(
      `DELETE FROM expected_expenses
      WHERE trip_id =$1`,
      [tripID]
    );

    await pool.query(
      `DELETE FROM trips
     WHERE tripid = $1`,
      [tripID]
    );
  });
});

describe("DELETE /api/delete-expense", () => {
  const tripID = randomUUID();
  const oneExpenseID = randomUUID();

  beforeAll(async () => {
    await pool.query(
      `INSERT INTO trips (tripid, ownerid, description, destination, from_date, to_date, status, default_split, auto_add, created_at, members)
     VALUES ($1, $2, 'Seed trip', 'Test Destination', '2026-01-01', '2026-01-10', 'Planning', 'equal', true, NOW(), 2)`,
      [tripID, userID]
    );

    await pool.query(
      `INSERT INTO expected_expenses (expense_id, trip_id, owner_id, name, amount, expected_date, expense_status, split, confirmed, confirmed_date) VALUES
    ($1, $2, $3, 'Flight', 1200.00, NULL, 'accepted', 'shared', false, NULL)`,
      [oneExpenseID, tripID, userID]
    );
  });

  it("Expense should be deleted", async () => {
    const res = await request(app)
      .delete("/api/delete-expense")
      .send({ expenseID: oneExpenseID });

    expect(res.statusCode).toBe(200);

    const check = await pool.query(
      `SELECT * FROM expected_expenses WHERE expense_id = $1`,
      [oneExpenseID]
    );

    expect(check.rows.length).toBe(0);
  });
});
