require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db.js");

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());

// Demo user with mariabelendistefano@gmail.com email
const DEMO_USER_ID = "c8379535-2cd7-4248-8c45-1c09ebac140f";

/**
 * This GET request returns all trips where the user has a role in
 */
app.get("/api/trips", async (req, res) => {
  /* BELEN NOTES: W5 - ADD USER ID TO THE API !!!! */
  try {
    const query = ` SELECT
            t.tripid,
            t.ownerid,
            t.destination,
            t.from_date,
            t.to_date,
            t.status,
            t.description,
            t.default_split,
            t.auto_add,
            r.role
        FROM trips AS t
        JOIN user_role AS r
        ON r.tripid = t.tripid
        WHERE r.user_id = $1`;

    const tripsResult = await pool.query(query, [DEMO_USER_ID]);

    return res.status(200).json(tripsResult.rows);
  } catch (err) {
    return res.status(500).send("Server error");
  }
});

/**
 * This POST request will create a Trip and a User Role as Owner
 */
app.post("/api/trip", async (req, res) => {
  /* BELEN NOTES: W5 - ADD USER ID TO THE API !!!! */
  const {
    destination,
    from_date,
    to_date,
    description,
    default_split,
    auto_add,
  } = req.body;

  if (destination == "") {
    return res.status(400).send("Error: destination cannot be empty");
  }

  if (from_date > to_date) {
    return res.status(400).send("Error: Trip must start before end date");
  }

  const tripQuery = `
      INSERT INTO trips (ownerid, destination, from_date, to_date, description, default_split, auto_add)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING tripid
    `;

  const roleQuery = `
      INSERT INTO user_role (tripid, user_id, role)
      VALUES ($1, $2, $3)
    `;

  const tripValues = [
    DEMO_USER_ID,
    destination,
    from_date,
    to_date,
    description,
    default_split,
    auto_add,
  ];

  try {
    const tripResult = await pool.query(tripQuery, tripValues);

    const newTripID = tripResult.rows[0]?.tripid;

    const roleValues = [newTripID, DEMO_USER_ID, "Owner"];

    const roleResult = await pool.query(roleQuery, roleValues);

    return res.status(200).json(roleResult);
  } catch (err) {
    return res.status(500).json(err);
  }
});

/**
 * This DELETE request will handle incoming requests without a trip ID
 */
app.delete("/api/trip", (req, res) =>
  res.status(400).json({ error: "Trip ID is required" })
);

/**
 * This DELETE request will delete a trip by its ID
 */
app.delete("/api/trip/:tripID", async (req, res) => {
  const { tripID } = req.params;

  if (!tripID || tripID == "") {
    return res.status(400).json("Trip ID is required");
  }

  const deleteTrip = `
  DELETE FROM trips
  WHERE tripid = $1
  RETURNING *`;

  try {
    const deleteTripResult = await pool.query(deleteTrip, [tripID]);

    return res.status(200).json(deleteTripResult);
  } catch (e) {
    return res.status(500).json(e);
  }
});

/**
 * This PUT request will update a trip
 */
app.put("/api/trip", async (req, res) => {
  const {
    tripID,
    destination,
    description,
    from_date,
    to_date,
    status,
    default_split,
    auto_add,
  } = req.body;

  if (destination == "" || tripID == "") {
    return res
      .status(400)
      .send("Error: destination and trip ID cannot be empty");
  }

  if (from_date > to_date) {
    return res.status(400).send("Error: Trip must start before end date");
  }

  const tripQuery = `
    UPDATE trips
    SET
      destination   = $1,
      description   = $2,
      from_date     = $3,
      to_date       = $4,
      status        = $5,
      default_split = $6,
      auto_add      = $7
    WHERE tripid    = $8
    RETURNING *;
    `;

  const tripNewValues = [
    destination,
    description,
    from_date,
    to_date,
    status,
    default_split,
    auto_add,
    tripID,
  ];

  try {
    const updateResult = await pool.query(tripQuery, tripNewValues);

    return res.status(200).json(updateResult);
  } catch (e) {
    return res.status(500).json(e);
  }
});

/**
 * This GET request will fetch the savings fund for the logged in user for a given trip
 */
app.get("/api/trip/savings", async (req, res) => {
  const { tripId, userId } = req.query;

  if (tripId == "" || userId == "") {
    return res.status(400).send("Error: Trip and User IDs cannot be empty");
  }

  const savingsQuery = `
    SELECT *
    FROM savings_funds
    WHERE trip_id = $1
    AND owner_id = $2
  `;

  try {
    const savingsResult = await pool.query(savingsQuery, [tripId, userId]);

    return res.status(200).json(savingsResult.rows);
  } catch (e) {
    return res.status(500).json(e);
  }
});

/**
 * This GET request will fetch all expenses for a given trip
 */
app.get("/api/trip/expenses/:tripID", async (req, res) => {
  const { tripID } = req.params;

  if (!tripID || tripID == "") {
    return res.status(400).json("Trip ID is required");
  }

  try {
    const query = `
    SELECT *
    FROM expected_expenses
    WHERE trip_id = $1`;

    const expensesResult = await pool.query(query, [tripID]);

    return res.status(200).json(expensesResult.rows);
  } catch (err) {
    return res.status(500).send("Server error");
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
