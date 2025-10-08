require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db.js");
const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");

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
            t.members,
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
 * This GET request returns the trip that matches the ID
 */
app.get("/api/trip/:tripID", async (req, res) => {
  const { tripID } = req.params;

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
            t.members,
            r.role
        FROM trips AS t
        JOIN user_role AS r
        ON r.tripid = t.tripid
        WHERE t.tripid = $1`;

    const tripResult = await pool.query(query, [tripID]);

    return res.status(200).json(tripResult.rows);
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
    members,
  } = req.body;

  if (destination == "") {
    return res.status(400).send("Error: destination cannot be empty");
  }

  if (from_date > to_date) {
    return res.status(400).send("Error: Trip must start before end date");
  }

  const tripQuery = `
      INSERT INTO trips (ownerid, destination, from_date, to_date, description, default_split, auto_add, members)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING tripid
    `;

  const roleQuery = `
      INSERT INTO user_role (tripid, user_id, role)
      VALUES ($1, $2, $3)
    `;

  const savingsFundQuery = `
      INSERT INTO savings_funds (trip_id, owner_id, amount)
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
    members,
  ];

  try {
    const tripResult = await pool.query(tripQuery, tripValues);

    const newTripID = tripResult.rows[0]?.tripid;

    const roleValues = [newTripID, DEMO_USER_ID, "Owner"];

    const roleResult = await pool.query(roleQuery, roleValues);

    const fundValues = [newTripID, DEMO_USER_ID, 0];

    const fundResult = await pool.query(savingsFundQuery, fundValues);

    return res
      .status(200)
      .json({ trip: tripResult, role: roleResult, fund: fundResult });
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

  if (!tripID || !destination || destination == "" || tripID == "") {
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
app.get("/api/savings", async (req, res) => {
  const { tripId, userId } = req.query;

  if (tripId === "" || userId === "") {
    return res.status(400).json("Error: Trip and User IDs cannot be empty");
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
    return res.status(500).json({ error: e.message });
  }
});

/**
 * This GET request will fetch all expenses for a given trip
 */
app.get("/api/expenses", async (req, res) => {
  const { tripId, userId } = req.query;

  if (tripId == "" || userId == "") {
    return res.status(400).json("Error: Trip and User IDs cannot be empty");
  }

  try {
    const query = `
    SELECT *
    FROM expected_expenses
    WHERE trip_id = $1 AND (owner_id = $2 OR "split" = 'shared')`;

    const expensesResult = await pool.query(query, [tripId, userId]);

    if (expensesResult.rows.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(expensesResult.rows);
  } catch (err) {
    console.error("GET /api/trip/savings failed", err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * This POST request will create an Expense for a trip
 */
app.post("/api/expenses", async (req, res) => {
  var { tripID, ownerID, name, amount, expectedDate, expenseStatus, split } =
    req.body;

  if (expectedDate == "") {
    expectedDate = null;
  }

  if (
    name == "" ||
    amount == 0 ||
    tripID == "" ||
    ownerID == "" ||
    expenseStatus == "" ||
    split == ""
  ) {
    return res
      .status(400)
      .send("Error: destination, amount, and split cannot be empty");
  }

  if (split != "shared" && split != "own") {
    return res.status(400).send("Split must be own or shared");
  }

  const expenseQuery = `
      INSERT INTO expected_expenses (trip_id, owner_id, name, amount, expected_date, expense_status, split)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

  const expenseValues = [
    tripID,
    ownerID,
    name,
    Number(amount),
    expectedDate,
    expenseStatus,
    split,
  ];

  try {
    const expenseResult = await pool.query(expenseQuery, expenseValues);

    return res.status(200).json({ expense: expenseResult });
  } catch (err) {
    return res.status(500).json(err);
  }
});

/**
 * This PUT request will update an Expense for a trip
 */
app.put("/api/expenses", async (req, res) => {
  var { expenseID, name, amount, expectedDate, split } = req.body;

  if (expectedDate == "") {
    expectedDate = null;
  }

  if (name == "" || amount == 0 || expenseID == "" || split == "") {
    return res
      .status(400)
      .send("Error: name, amount, and split cannot be empty");
  }

  if (split != "shared" && split != "own") {
    return res.status(400).send("Split must be own or shared");
  }

  const expenseQuery = `
      UPDATE expected_expenses
      SET
        name   = $1,
        amount = $2,
        expected_date = $3,
        split = $4
      WHERE expense_id = $5
      RETURNING *`;

  const expenseValues = [name, Number(amount), expectedDate, split, expenseID];

  try {
    const expenseResult = await pool.query(expenseQuery, expenseValues);

    return res.status(200).json({ expense: expenseResult });
  } catch (err) {
    return res.status(500).json(err);
  }
});

/**
 * This PUT request will update a savings fund amount
 */
app.put("/api/trip/savings", async (req, res) => {
  const { savingsFundID, amount, newAmount } = req.body;

  if (!savingsFundID || savingsFundID == "") {
    return res.status(400).send("Error: Savings fund ID is required");
  }

  if (newAmount == 0) {
    return res.status(400).send("Error: New amount cannot be 0");
  }

  const updatedAmount = Number(amount) + Number(newAmount);

  const updateQuery = `UPDATE savings_funds
    SET
      amount   = $1
    WHERE savings_funds_id = $2
    RETURNING *
    `;

  try {
    const savingsUpdateResult = await pool.query(updateQuery, [
      updatedAmount,
      savingsFundID,
    ]);

    return res.status(200).json({ expenseUpdate: savingsUpdateResult });
  } catch (err) {
    return res.status(500).json(err);
  }
});

/**
 * This GET request will fetch all user roles for a given trip
 */
app.get("/api/userroles", async (req, res) => {
  const { tripId } = req.query;

  if (tripId == "") {
    return res.status(400).json("Error: Trip ID cannot be empty");
  }

  try {
    const query = `
    SELECT
      t.destination,
      t.from_date,
      t.to_date,
      t.status,
      t.default_split,
      t.members,
      r.role,
      r.userroleid,
      u.name,
      u.email
    FROM user_role AS r
    JOIN trips AS t
    ON r.tripid = t.tripid
    JOIN users u
    ON u.id = r.user_id
    WHERE r.tripid = $1`;

    const userRolesData = await pool.query(query, [tripId]);

    if (userRolesData.rows.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(userRolesData.rows);
  } catch (err) {
    console.error("GET /api/trip/savings failed", err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Invite members to a trip
 */
app.post("/api/addmember", async (req, res) => {
  const { tripID, userID, destinationEmail, memberType } = req.body;

  if (!tripID || tripID == "") {
    return res.status(400).send("Error: Trip ID is required");
  }

  if (!userID || userID == "") {
    return res.status(400).send("Error: User ID is required");
  }

  if (!destinationEmail || destinationEmail == "") {
    return res.status(400).send("Error: Destination email is required");
  }

  if (!memberType || memberType == "") {
    return res.status(400).send("Error: Member type can't be empty");
  }

  if (memberType != "guest" && memberType != "participant") {
    return res
      .status(400)
      .send("Error: Member type must be member or participant");
  }

  // Get logged in user's name to add to the email
  const loggedinUserQuery = `
    SELECT *
    FROM users
    WHERE id = $1`;

  try {
    const userData = await pool.query(loggedinUserQuery, [userID]);

    if (userData.rows.length === 0) {
      return res.status(400).send("Error with logged in user");
    }

    const user = userData.rows[0];

    // Create an invitation record on the db with the sent invitation

    const tripInvitation = `
      INSERT INTO trip_invitations (trip_id, sender_id, recipient_email, status, member_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const tripInvitationResult = await pool.query(tripInvitation, [
      tripID,
      userID,
      destinationEmail,
      "pending",
      memberType,
    ]);

    if (tripInvitationResult.rows.length === 0) {
      return res.status(500).send("Error sending invitation");
    }

    const invitationID = tripInvitationResult.rows[0].id;

    const invitationEmail = await sendInvitationEmail(
      invitationID,
      user.name,
      destinationEmail
    );

    if (!invitationEmail.ok) {
      return res.status(500).json({ error: invitationEmail.error });
    }

    return res.status(200).json(invitationEmail);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/**
 * Accept invitation to a trip
 */
app.get("/api/acceptinvitation", async (req, res) => {
  const { invitation_token } = req.query;

  if (!invitation_token || invitation_token == "") {
    return res.status(400).send("Error: Invitation token cannot be empty");
  }

  const invitationFetchQuery = `
    SELECT *
    FROM trip_invitations
    WHERE id   = $1`;

  try {
    const invitationData = await pool.query(invitationFetchQuery, [
      invitation_token,
    ]);

    if (invitationData.rows.length === 0) {
      return res.status(400).send("Error with invitation");
    }

    const invitation = invitationData.rows[0];
    console.log(invitation);

    if (invitation.status === "declined") {
      return res.status(500).json({ result: "Cannot accept a declined trip" });
    }

    const acceptQuery = `
    UPDATE trip_invitations
    SET
      status   = 'accepted'
    WHERE id   = $1
    RETURNING *;
    `;

    const acceptInvitationResult = await pool.query(acceptQuery, [
      invitation_token,
    ]);

    if (acceptInvitationResult.rows.length === 0) {
      return res.status(500).json({ result: "Error accepting trip" });
    }

    return res.status(200).json({
      tripID: invitation.trip_id,
      memberType: invitation.member_type,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/**
 * Reject invitation to a trip
 */
app.get("/api/rejectinvitation", async (req, res) => {
  const { invitation_token } = req.query;

  if (!invitation_token || invitation_token == "") {
    return res.status(400).send("Error: Invitation token cannot be empty");
  }

  const invitationQuery = `
    UPDATE trip_invitations
    SET
      status   = 'declined'
    WHERE id   = $1
    RETURNING *;
    `;

  try {
    const tripInvitationResult = await pool.query(invitationQuery, [
      invitation_token,
    ]);

    console.log(tripInvitationResult);
    if (tripInvitationResult.rows.length === 0) {
      return res.status(500).send("Error rejecting invitation");
    }

    return res.status(200).json({ result: "Trip rejected" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/**
 * This API call handles sending email invitations to members via MailerSend
 * @param {*} invitationID invitation ID to accept/reject
 * @param {*} username sender name
 * @param {*} email destination email
 * @returns
 */
async function sendInvitationEmail(invitationID, username, email) {
  const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY,
  });

  const sentFrom = new Sender(
    "no-reply@test-y7zpl98q6qo45vx6.mlsender.net",
    username + " via Wanderfunds"
  );

  const recipients = [new Recipient(email, "Member")];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject(`${username} invited you to join a trip!`).setHtml(`
    <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
      <h2 style="color:#2c3e50;">${username} is inviting you to join a trip ✈️</h2>
      <p>Click the button below to accept the invitation:</p>
      <a href="https://wanderfunds-backend.onrender.com/api/acceptinvitation?invitation_token=${invitationID}"
         style="display:inline-block; padding:12px 20px; margin-top:10px;
                background-color:#8ebed8; color:#fff; text-decoration:none;
                border-radius:6px; font-weight:bold;">
        Accept Invitation
      </a>
      <a href="https://wanderfunds-backend.onrender.com/api/rejectinvitation?invitation_token=${invitationID}"
         style="display:inline-block; padding:12px 20px; margin-top:10px;
                background-color:#ff7373; color:#fff; text-decoration:none;
                border-radius:6px; font-weight:bold;">
        Reject Invitation
      </a>
    </div>
  `);

  try {
    const resp = await mailerSend.email.send(emailParams);
    return {
      ok: true,
      id: invitationID,
      mailerSendId: resp?.body?.message_id ?? null,
    };
  } catch (err) {
    console.error("Error sending email:", err);
    return { ok: false, error: err.message };
  }
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
