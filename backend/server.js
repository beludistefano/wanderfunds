require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db.js");
const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
const { requireAuth } = require("./authMiddleware");
const { supabaseAdmin } = require("./supabase.js");

const app = express();
const port = process.env.PORT;

const allowedOrigins = [
  "http://localhost:5173",
  "https://wanderfunds-frontend.onrender.com",
];

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    return allowedOrigins.includes(origin)
      ? cb(null, true)
      : cb(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(express.json());

/**
 * This GET request returns all trips where the user has a role in
 */
app.get("/api/trips", requireAuth, async (req, res) => {
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

    const tripsResult = await pool.query(query, [req.user.id]);

    return res.status(200).json(tripsResult.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" + err });
  }
});

/**
 * This GET request returns the trip that matches the ID
 */
app.get("/api/trip/:tripID", requireAuth, async (req, res) => {
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
        WHERE t.tripid = $1
        AND r.user_id = $2`;

    const tripResult = await pool.query(query, [tripID, req.user.id]);

    return res.status(200).json(tripResult.rows);
  } catch (err) {
    return res.status(500).json({ error: "Server error" + err });
  }
});

/**
 * This POST request will create a Trip and a User Role as Owner
 */
app.post("/api/trip", requireAuth, async (req, res) => {
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
    req.user.id,
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

    const roleValues = [newTripID, req.user.id, "Owner"];

    const roleResult = await pool.query(roleQuery, roleValues);

    const fundValues = [newTripID, req.user.id, 0];

    const fundResult = await pool.query(savingsFundQuery, fundValues);

    return res
      .status(200)
      .json({ trip: tripResult, role: roleResult, fund: fundResult });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

/**
 * This DELETE request will handle incoming requests without a trip ID
 */
app.delete("/api/trip", requireAuth, (req, res) =>
  res.status(400).json({ error: "Trip ID is required" })
);

/**
 * This GET request will return the user role of the logged in user for a given trip
 */
app.get("/api/trip/user_role/:tripID", requireAuth, async (req, res) => {
  const { tripID } = req.params;

  if (!tripID || tripID == "") {
    return res.status(400).json("Trip ID is required");
  }

  const roleQuery = `
    SELECT role
    FROM user_role
    WHERE tripid = $1
    AND user_id = $2
  `;

  try {
    const userRoleResult = await pool.query(roleQuery, [tripID, req.user.id]);

    if (userRoleResult.rows.length <= 0) {
      return res.status(204).json({ role: "no content" });
    }

    return res.status(200).json({ role: userRoleResult.rows[0] });
  } catch (e) {
    return res.status(500).json({ error: e });
  }
});

/**
 * This DELETE request will delete a trip by its ID
 */
app.delete("/api/trip/:tripID", requireAuth, async (req, res) => {
  const { tripID } = req.params;

  if (!tripID || tripID == "") {
    return res.status(400).json("Trip ID is required");
  }

  const relatedRolesQuery = `
    SELECT user_id, t.destination
    FROM user_role as u
    JOIN trips as t
    ON u.tripid = t.tripid
    WHERE u.user_id != $1
    AND u.tripid = $2
  `;

  const deleteTrip = `
  DELETE FROM trips
  WHERE tripid = $1
  RETURNING *`;

  try {
    const usersAssociated = await pool.query(relatedRolesQuery, [
      req.user.id,
      tripID,
    ]);

    const deleteTripResult = await pool.query(deleteTrip, [tripID]);

    if (deleteTripResult.rowCount == 0) {
      return res.status(404).json({ result: "Trip not found" });
    }

    var notificationCreationResult = "";

    if (usersAssociated.rows.length > 0) {
      const notifTitle = `Trip deleted!`;
      const notifDesc = `Your trip to ${usersAssociated.rows[0].destination} has been deleted by its owner!`;

      const values = usersAssociated.rows
        .map((_, i) => `($1, $2, $3, $${i + 4})`)
        .join(", ");

      const bulkCreateNotifications = `
        INSERT INTO notifications (notif_title, notif_desc, read, user_id)
        VALUES ${values}
      `;

      const params = [
        notifTitle,
        notifDesc,
        false,
        ...usersAssociated.rows.map((user) => user.user_id),
      ];

      notificationCreationResult = await pool.query(
        bulkCreateNotifications,
        params
      );
    }

    if (
      notificationCreationResult != "" &&
      notificationCreationResult.rowCount == 0
    ) {
      return res
        .status(500)
        .json({ result: "Trip deleted; failed notifications" });
    }

    return res.status(200).json(deleteTripResult);
  } catch (e) {
    return res.status(500).json({ error: e });
  }
});

/**
 * This PUT request will update a trip with all owner fields
 */
app.put("/api/trip", requireAuth, async (req, res) => {
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
    return res.status(500).json({ error: e });
  }
});

/**
 * This PUT request will update a trip with participant fields
 */
app.put("/api/trip-participant", requireAuth, async (req, res) => {
  const { tripID, destination, description, from_date, to_date, status } =
    req.body;

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
      status        = $5
    WHERE tripid    = $6
    RETURNING *;
    `;

  const tripNewValues = [
    destination,
    description,
    from_date,
    to_date,
    status,
    tripID,
  ];

  try {
    const updateResult = await pool.query(tripQuery, tripNewValues);

    return res.status(200).json(updateResult);
  } catch (e) {
    return res.status(500).json({ error: e });
  }
});

/**
 * This GET request will fetch the savings fund for the logged in user for a given trip
 */
app.get("/api/savings", requireAuth, async (req, res) => {
  const { tripId } = req.query;

  if (tripId === "") {
    return res.status(400).json("Error: Trip ID cannot be empty");
  }

  const savingsQuery = `
    SELECT *
    FROM savings_funds
    WHERE trip_id = $1
    AND owner_id = $2
  `;

  try {
    const savingsResult = await pool.query(savingsQuery, [tripId, req.user.id]);

    return res.status(200).json(savingsResult.rows);
  } catch (e) {
    return res.status(500).json({ error: e });
  }
});

/**
 * This GET request will fetch all expenses for a given trip
 */
app.get("/api/expenses", requireAuth, async (req, res) => {
  const { tripId } = req.query;

  if (tripId == "") {
    return res.status(400).json("Error: Trip ID cannot be empty");
  }

  try {
    const query = `
    SELECT *
    FROM expected_expenses
    WHERE trip_id = $1 AND (owner_id = $2 OR "split" = 'shared')`;

    const expensesResult = await pool.query(query, [tripId, req.user.id]);

    if (expensesResult.rows.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(expensesResult.rows);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

/**
 * This GET request will fetch all confirmed expenses for a given trip
 */
app.get("/api/confirmed-expenses", requireAuth, async (req, res) => {
  const { tripId } = req.query;

  if (tripId == "") {
    return res.status(400).json("Error: Trip ID cannot be empty");
  }

  try {
    const query = `
    SELECT *
    FROM expected_expenses
    WHERE trip_id = $1 AND (owner_id = $2 OR "split" = 'shared') AND confirmed = true`;

    const expensesResult = await pool.query(query, [tripId, req.user.id]);

    if (expensesResult.rows.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(expensesResult.rows);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

/**
 * This POST request will create an Expense for a trip
 */
app.post("/api/expenses", requireAuth, async (req, res) => {
  var { tripID, name, amount, expectedDate, expenseStatus, split } = req.body;

  if (expectedDate == "") {
    expectedDate = null;
  }

  if (
    name == "" ||
    amount == 0 ||
    tripID == "" ||
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

  const getTripOwnerQuery = `
    SELECT ownerid, destination FROM trips
    WHERE tripid = $1
  `;

  const notificationQuery = `
    INSERT INTO notifications (notif_title, notif_desc, read, user_id)
    VALUES ($1, $2, $3, $4)
  `;

  const expenseValues = [
    tripID,
    req.user.id,
    name,
    Number(amount),
    expectedDate,
    expenseStatus,
    split,
  ];

  try {
    const expenseResult = await pool.query(expenseQuery, expenseValues);

    if (expenseStatus == "pending") {
      const tripOwnerResult = await pool.query(getTripOwnerQuery, [tripID]);

      if (tripOwnerResult.rowCount > 0) {
        const trip = tripOwnerResult.rows[0];

        const notifParam = [
          "New expense to review!",
          `Please review the new expense added to your trip to ${trip.destination}`,
          false,
          trip.ownerid,
        ];

        const notifResult = await pool.query(notificationQuery, notifParam);
      }
    }

    return res.status(200).json({ expense: expenseResult });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

/**
 * This POST request will create a confirmed Expense for a trip
 */
app.post("/api/confirmed-expenses", requireAuth, async (req, res) => {
  var {
    tripID,
    name,
    amount,
    expectedDate,
    confirmedDate,
    expenseStatus,
    split,
    members,
  } = req.body;

  if (expectedDate == "") {
    expectedDate = null;
  }

  if (
    name == "" ||
    amount == 0 ||
    tripID == "" ||
    expenseStatus == "" ||
    split == "" ||
    confirmedDate == "" ||
    members == ""
  ) {
    return res
      .status(400)
      .send(
        "Error: destination, amount, confirmation date and split cannot be empty"
      );
  }

  if (split != "shared" && split != "own") {
    return res.status(400).send("Split must be own or shared");
  }

  const expenseQuery = `
      INSERT INTO expected_expenses (trip_id, owner_id, name, amount, expected_date, expense_status, split, confirmed, confirmed_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

  const expenseValues = [
    tripID,
    req.user.id,
    name,
    Number(amount),
    expectedDate,
    expenseStatus,
    split,
    true,
    confirmedDate,
  ];

  try {
    const expenseResult = await pool.query(expenseQuery, expenseValues);

    if (expenseResult.rowCount == 0) {
      return res.status(500).json({ error: "Error adding confirmed expense" });
    }

    if (split == "own") {
      const updateSavingsFunds = `
        UPDATE savings_funds
        SET amount = amount - $1
        WHERE owner_id = $2
          AND amount > $3
      `;

      const updateSavingsValues = [amount, req.user.id, amount];

      const updateResult = await pool.query(
        updateSavingsFunds,
        updateSavingsValues
      );

      console.log(updateResult);
    } else {
      const updateSavingsFunds = `
        UPDATE savings_funds
        SET amount = amount - $1
        WHERE trip_id = $2
          AND amount > $3
      `;

      const share = Number(amount) / Number(members);

      const updateSavingsValues = [share, tripID, share];

      const updateResult = await pool.query(
        updateSavingsFunds,
        updateSavingsValues
      );

      console.log(updateResult);
    }

    return res.status(200).json({ expense: expenseResult });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

/**
 * This PUT request will update an Expense for a trip
 */
app.put("/api/expenses", requireAuth, async (req, res) => {
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
    return res.status(500).json({ error: err });
  }
});

/**
 * This PUT request will set an Expense as accepted
 */
app.put("/api/accept-expense", requireAuth, async (req, res) => {
  var { expenseID } = req.body;

  if (!expenseID) {
    return res.status(400).send("Error: expense ID cannot be empty");
  }

  const expenseQuery = `
      UPDATE expected_expenses
      SET
        expense_status = 'accepted'
      WHERE expense_id = $1`;

  try {
    const expenseResult = await pool.query(expenseQuery, [expenseID]);

    console.log(expenseResult);

    if (expenseResult.rowCount == 0) {
      return res.status(500).json({ result: "Error accepting expense" });
    }
    return res.status(200).json({ result: "Confirmed" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ result: "Error accepting expense" + err });
  }
});

/**
 * This DELETE request will delete an expense
 */
app.delete("/api/delete-expense", requireAuth, async (req, res) => {
  var { expenseID } = req.body;

  if (!expenseID) {
    return res.status(400).send("Error: expense ID cannot be empty");
  }

  const expenseQuery = `
      DELETE FROM expected_expenses
      WHERE expense_id = $1`;

  try {
    const expenseResult = await pool.query(expenseQuery, [expenseID]);

    if (expenseResult.rowCount == 0) {
      return res.status(500).json({ result: "Error deleting expense" });
    }
    return res.status(200).json({ result: "Deleted" });
  } catch (err) {
    return res.status(500).json({ result: "Error accepting expense " + err });
  }
});

/**
 * This PUT request will update a savings fund amount
 */
app.put("/api/trip/savings", requireAuth, async (req, res) => {
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
    return res.status(500).json({ error: err });
  }
});

/**
 * This GET request will fetch all user roles for a given trip
 */
app.get("/api/userroles", requireAuth, async (req, res) => {
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
      r.user_id,
      p.name,
      au.email
    FROM public.user_role AS r
    JOIN public.trips AS t
    ON r.tripid  = t.tripid
    JOIN auth.users AS au
    ON au.id = r.user_id
    JOIN public.profiles AS p
    ON p.user_id     = au.id
    WHERE r.tripid = $1`;

    const userRolesData = await pool.query(query, [tripId]);

    if (userRolesData.rows.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(userRolesData.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * Invite members to a trip
 */
app.post("/api/addmember", requireAuth, async (req, res) => {
  const { tripID, destinationEmail, memberType } = req.body;

  if (!tripID || tripID == "") {
    return res.status(400).send("Error: Trip ID is required");
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
    FROM profiles
    WHERE user_id = $1`;

  try {
    const userData = await pool.query(loggedinUserQuery, [req.user.id]);

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
      req.user.id,
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
 * This endpoint will retrieve the logged in user's profile
 */
app.get("/api/profile", requireAuth, async (req, res) => {
  const profileQuery = `
    SELECT *
    FROM profiles
    WHERE user_id = $1
  `;
  try {
    const profileData = await pool.query(profileQuery, [req.user.id]);

    if (profileData.rows.length === 0) {
      return res.status(500).json({ error: profileData.error });
    }

    return res.status(200).json(profileData.rows[0]);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/**
 * This endpoint will create a profile for a recently registrated user
 */
app.post("/api/profile", async (req, res) => {
  const { name, user_id, email } = req.body;

  if (!name || name == "") {
    return res.status(400).send("Error: Name cannot be empty");
  }

  if (!user_id || user_id == "") {
    return res.status(400).send("Error: User ID cannot be empty");
  }

  if (!email || email == "") {
    return res.status(400).send("Error: Email cannot be empty");
  }

  const createProfileQuery = `
    INSERT INTO profiles (user_id, name, email, email_notifications)
    VALUES ($1, $2, $3, $4)
    `;

  try {
    const createProfile = await pool.query(createProfileQuery, [
      user_id,
      name,
      email,
      true,
    ]);

    return res.status(200).json({ result: "Profile created" });
  } catch (e) {
    return res.status(500).json({ error: e });
  }
});

/**
 * This endpoint will update the the logged in user's name and email notif preferences on their profile
 */
app.put("/api/profile", requireAuth, async (req, res) => {
  const { name, email_notifications } = req.body;

  if (!name || name == "") {
    return res.status(400).send("Error: Name cannot be empty");
  }

  const updateProfileQuery = `
    UPDATE profiles
    SET
      name   = $1,
      email_notifications = $2
    WHERE user_id = $3
    `;

  try {
    const profileUpdate = await pool.query(updateProfileQuery, [
      name,
      email_notifications,
      req.user.id,
    ]);

    return res.status(200).json({ result: "Profile updated" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/**
 * This DELETE request will delete a user and profile
 */
app.delete("/api/profile", requireAuth, async (req, res) => {
  const relatedRolesQuery = `
    SELECT user_id, t.destination
    FROM user_role as u
    JOIN trips as t
    ON u.tripid = t.tripid
    WHERE t.ownerid = $1
    AND u.user_id != $2
  `;

  const updateExpensesQuery = `
    UPDATE expected_expenses e
    SET owner_id = t.ownerid
    FROM trips t
    WHERE e.owner_id = $1
      AND e.split = 'shared'
      AND e.trip_id = t.tripid
    RETURNING e.*`;

  const deleteProfileQuery = `
    DELETE FROM profiles
    WHERE user_id = $1
    `;

  const deleteOwnedTripsQuery = `
    DELETE FROM trips
    WHERE ownerid = $1
  `;

  const deleteOwnedExpensesQuery = `
    DELETE FROM expected_expenses
    WHERE owner_id = $1
    AND split = 'own'
  `;

  const deleteUserRolesQuery = `
    DELETE FROM user_role
    WHERE user_id = $1`;

  const deleteSavingsFundQuery = `
    DELETE FROM savings_funds
    WHERE owner_id = $1`;

  const deleteNotificationsQuery = `
    DELETE FROM notifications
    WHERE user_id = $1`;

  const tripInvitationsQuery = `
    DELETE FROM trip_invitations
    WHERE sender_id = $1`;

  try {
    const relatedUsersResult = await pool.query(relatedRolesQuery, [
      req.user.id,
      req.user.id,
    ]);

    const updateExpenses = await pool.query(updateExpensesQuery, [req.user.id]);

    console.log(updateExpenses);

    const deleteProfile = await pool.query(deleteProfileQuery, [req.user.id]);

    if (deleteProfile.rowCount == 0) {
      return res.status(500).json({ result: "Error deleting profile" });
    }

    const deleteSavingsFund = await pool.query(deleteSavingsFundQuery, [
      req.user.id,
    ]);

    console.log(deleteSavingsFund);

    const deleteExpenses = await pool.query(deleteOwnedExpensesQuery, [
      req.user.id,
    ]);

    console.log(deleteExpenses);

    const deleteNotifications = await pool.query(deleteNotificationsQuery, [
      req.user.id,
    ]);

    console.log(deleteNotifications);

    const deleteInvitations = await pool.query(tripInvitationsQuery, [
      req.user.id,
    ]);

    console.log(deleteInvitations);

    const deleteRoles = await pool.query(deleteUserRolesQuery, [req.user.id]);

    console.log(deleteRoles);

    const deleteOwnerTrips = await pool.query(deleteOwnedTripsQuery, [
      req.user.id,
    ]);

    console.log(deleteOwnerTrips);

    const deleteAuthUser = await supabaseAdmin.auth.admin.deleteUser(
      req.user.id
    );

    console.log(deleteAuthUser);

    var notificationsResult = "";

    if (relatedUsersResult.rows.length > 0) {
      const values = relatedUsersResult.rows
        .map((_, i) => {
          const base = i * 4 + 1;
          return `($${base}, $${base + 1}, $${base + 2}, $${base + 3})`;
        })
        .join(", ");

      const bulkCreateNotifications = `
        INSERT INTO notifications (notif_title, notif_desc, read, user_id)
        VALUES ${values}
      `;

      const params = relatedUsersResult.rows.flatMap((row) => [
        "Trip deleted!",
        `Your trip to ${row.destination} has been deleted because the owner deleted their account!`,
        false,
        row.user_id,
      ]);

      notificationsResult = await pool.query(bulkCreateNotifications, params);
    }

    if (notificationsResult != "" && notificationsResult.rowCount == 0) {
      return res.status(500).json({
        result: "User deleted succesfully but problem with notifications",
      });
    }

    return res.status(200).json({ result: "User deleted succesfully" });
  } catch (e) {
    return res.status(500).json({ error: e });
  }
});

/**
 * This POST request will remove a member from a trip
 */
app.post("/api/remove-member", requireAuth, async (req, res) => {
  const { memberID, tripID, memberRole } = req.body;

  if (!memberID || memberID == "") {
    return res.status(400).send("Error: Member cannot be empty");
  }

  if (!tripID || tripID == "") {
    return res.status(400).send("Error: Trip ID cannot be empty");
  }

  if (!memberRole || memberRole == "") {
    return res.status(400).send("Error: Member role cannot be empty");
  }

  const deleteUserRoleQuery = `
    DELETE FROM user_role
    WHERE tripid = $1
    AND user_id = $2
  `;

  const deleteSavingsFund = `
    DELETE FROM savings_fund
    WHERE trip_id = $1
    AND owner_id = $2
  `;

  const updateExpensesQuery = `
    UPDATE expected_expenses e
    SET owner_id = t.ownerid
    FROM trips t
    WHERE e.owner_id = $1
      AND e.trip_id = $2
      AND e.split = 'shared'
      AND e.trip_id = t.tripid
    RETURNING e.*`;

  const deleteFullyOwnedExpenses = `
    DELETE FROM expected_expenses
    WHERE owner_id = $1
    AND trip_id = $2
    AND split = 'own'
  `;

  try {
    const updateExpensesResult = await pool.query(updateExpensesQuery, [
      memberID,
      tripID,
    ]);

    const fullyOwnedResult = await pool.query(deleteFullyOwnedExpenses, [
      memberID,
      tripID,
    ]);

    if (memberRole != "Guest") {
      const savingsFundResult = await pool.query(deleteSavingsFund, [
        tripID,
        memberID,
      ]);
    }

    const deleteUserRole = await pool.query(deleteUserRoleQuery, [
      tripID,
      memberID,
    ]);

    return res.status(200).json({ result: "Member removed succesfully" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: e });
  }
});

/**
 * Accept invitation to a trip
 */
app.get("/api/acceptinvitation", requireAuth, async (req, res) => {
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
 * This POST endpoint will create a user role - usually triggered after member accepting an invitation
 */
app.post("/api/user-role", requireAuth, async (req, res) => {
  const { tripID, member_type } = req.body;

  if (tripID == "" || member_type == "") {
    return res
      .status(400)
      .send("Error: Trip ID and member type cannot be empty");
  }

  const roleQuery = `
    INSERT INTO user_role (tripid, user_id, role)
    VALUES ($1, $2, $3)
  `;

  try {
    const roleValues = [tripID, req.user.id, member_type];

    const roleResult = await pool.query(roleQuery, roleValues);

    if (roleResult.rowCount == 0) {
      return res.status(404).json({ result: "Error adding user role" });
    }

    return res.status(200).json({ result: "Success" });
  } catch (e) {
    return res.status(500).json({ result: e });
  }
});

/**
 * This POST endpoint will initialize a savings fund
 */
app.post("/api/new-savings-fund", requireAuth, async (req, res) => {
  const { tripID } = req.body;

  if (tripID == "") {
    return res.status(400).send("Error: Trip ID cannot be empty");
  }

  const savingsFundQuery = `
    INSERT INTO savings_funds (trip_id, owner_id, amount)
    VALUES ($1, $2, $3)
  `;

  try {
    const savingsFundValues = [tripID, req.user.id, 0];

    const savingsFundResult = await pool.query(
      savingsFundQuery,
      savingsFundValues
    );

    if (savingsFundResult.rowCount == 0) {
      return res.status(404).json({ result: "Error creating savings fund" });
    }

    return res.status(200).json({ result: "Success" });
  } catch (e) {
    return res.status(500).json({ result: "Error creating savings fund " + e });
  }
});

/**
 * This POST endpoint will store flight data for a trip
 */
app.post("/api/add-flight", requireAuth, async (req, res) => {
  const {
    tripID,
    flightNumber,
    flightDate,
    airportFrom,
    departureTime,
    airportTo,
    arrivalTime,
    reservationCode,
    confirmed,
  } = req.body;

  if (tripID == "" || flightNumber == "") {
    return res
      .status(400)
      .send("Error: Trip ID and flight number cannot be empty");
  }

  const addFlightDataQuery = `
    INSERT INTO trip_flights (flight_number, flight_date, airport_from, departure_time, airport_to, arrival_time, reservation_code, trip_id, confirmed)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id
  `;

  try {
    const tripFlightValues = [
      flightNumber,
      flightDate,
      airportFrom,
      departureTime,
      airportTo,
      arrivalTime,
      reservationCode,
      tripID,
      confirmed,
    ];

    const tripFlightResult = await pool.query(
      addFlightDataQuery,
      tripFlightValues
    );

    if (tripFlightResult.rowCount == 0) {
      return res.status(404).json({ result: "Error adding flight data" });
    }

    return res
      .status(200)
      .json({ result: "Success", id: tripFlightResult.rows[0].id });
  } catch (e) {
    return res.status(500).json({ result: "Error adding flight data " + e });
  }
});

/**
 * This POST endpoint will store hotel data for a trip
 */
app.post("/api/add-hotel", requireAuth, async (req, res) => {
  const {
    tripID,
    hotelName,
    address,
    dateFrom,
    dateTo,
    reservationWebsite,
    confirmed,
  } = req.body;

  if (tripID == "" || hotelName == "") {
    return res
      .status(400)
      .send("Error: Trip ID and hotel name cannot be empty");
  }

  const tripHotelQuery = `
    INSERT INTO trip_hotel (hotel_name, address, date_from, date_to, reservation_website, trip_id, confirmed)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id
  `;

  try {
    const tripHotelValues = [
      hotelName,
      address,
      dateFrom,
      dateTo,
      reservationWebsite,
      tripID,
      confirmed,
    ];

    const tripHotelResult = await pool.query(tripHotelQuery, tripHotelValues);

    if (tripHotelResult.rowCount == 0) {
      return res.status(404).json({ result: "Error adding hotel data" });
    }

    return res
      .status(200)
      .json({ result: "Success", id: tripHotelResult.rows[0].id });
  } catch (e) {
    return res.status(500).json({ result: "Error adding hotel data " + e });
  }
});

/**
 * This POST endpoint will store other data for a trip itinerary
 */
app.post("/api/add-itinerary", requireAuth, async (req, res) => {
  const { tripID, itineraryType, itineraryDesc, confirmed } = req.body;

  if (tripID == "" || itineraryType == "") {
    return res
      .status(400)
      .send("Error: Trip ID and itinerary type cannot be empty");
  }

  const itineraryQuery = `
    INSERT INTO trip_itinerary (itinerary_type, itinerary_desc, trip_id, confirmed)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;

  try {
    const itineraryValues = [itineraryType, itineraryDesc, tripID, confirmed];

    const itineraryResults = await pool.query(itineraryQuery, itineraryValues);

    if (itineraryResults.rowCount == 0) {
      return res.status(404).json({ result: "Error adding itinerary data" });
    }

    return res
      .status(200)
      .json({ result: "Success", id: itineraryResults.rows[0].id });
  } catch (e) {
    return res.status(500).json({ result: "Error adding itinerary data " + e });
  }
});

/**
 * This PUT endpoint will store the file URL in the itinerary data
 */
app.put("/api/update-itinerary", requireAuth, async (req, res) => {
  const { itID, fileURL } = req.body;

  if (itID == "" || fileURL == "") {
    return res.status(400).send("Error: ID and file URL cannot be empty");
  }

  const itineraryQuery = `
    UPDATE trip_itinerary
    SET file_url = $1
    WHERE id = $2
  `;

  try {
    const itineraryValues = [fileURL, itID];

    const itineraryResults = await pool.query(itineraryQuery, itineraryValues);

    if (itineraryResults.rowCount == 0) {
      return res.status(404).json({ result: "Error updating itinerary data" });
    }

    return res.status(200).json({ result: "Success" });
  } catch (e) {
    return res.status(500).json({ result: "Error adding itinerary data " + e });
  }
});

/**
 * This PUT endpoint will update the file URL in the flight data
 */
app.put("/api/update-flight", requireAuth, async (req, res) => {
  const { flightID, fileURL } = req.body;

  if (flightID == "" || fileURL == "") {
    return res.status(400).send("Error: ID and file URL cannot be empty");
  }

  const flightQuery = `
    UPDATE trip_flights
    SET file_url = $1
    WHERE id = $2
  `;

  try {
    const flightValues = [fileURL, flightID];

    const flightResults = await pool.query(flightQuery, flightValues);

    if (flightResults.rowCount == 0) {
      return res.status(404).json({ result: "Error updating flight data" });
    }

    return res.status(200).json({ result: "Success" });
  } catch (e) {
    return res.status(500).json({ result: "Error adding itinerary data " + e });
  }
});

/**
 * This PUT endpoint will store the file URL in the hotel data
 */
app.put("/api/update-hotel", requireAuth, async (req, res) => {
  const { hotelID, fileURL } = req.body;

  if (hotelID == "" || fileURL == "") {
    return res.status(400).send("Error: ID and file URL cannot be empty");
  }

  const hotelQuery = `
    UPDATE trip_hotel
    SET file_url = $1
    WHERE id = $2
  `;

  try {
    const hotelValues = [fileURL, hotelID];

    const hotelResults = await pool.query(hotelQuery, hotelValues);

    if (hotelResults.rowCount == 0) {
      return res.status(404).json({ result: "Error updating hotel data" });
    }

    return res.status(200).json({ result: "Success" });
  } catch (e) {
    return res.status(500).json({ result: "Error adding itinerary data " + e });
  }
});

/**
 * This GET request returns the flights that match the trip ID
 */
app.get("/api/flights/:tripID", requireAuth, async (req, res) => {
  const { tripID } = req.params;

  try {
    const query = `
        SELECT *
        FROM trip_flights
        WHERE trip_id = $1`;

    const tripFlights = await pool.query(query, [tripID]);

    return res.status(200).json(tripFlights.rows);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

/**
 * This GET request returns the hotels that match the trip ID
 */
app.get("/api/hotels/:tripID", requireAuth, async (req, res) => {
  const { tripID } = req.params;

  try {
    const query = `
        SELECT *
        FROM trip_hotel
        WHERE trip_id = $1`;

    const tripHotels = await pool.query(query, [tripID]);

    return res.status(200).json(tripHotels.rows);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

/**
 * This PUT endpoint will confirm a flight
 */
app.put("/api/confirm-flight", requireAuth, async (req, res) => {
  const { flightID } = req.body;

  if (flightID == "") {
    return res.status(400).send("Error: ID cannot be empty");
  }

  const confirmQuery = `
    UPDATE trip_flights
    SET confirmed = $1
    WHERE id = $2
  `;

  try {
    const confirmValues = [true, flightID];

    const confirmResults = await pool.query(confirmQuery, confirmValues);

    if (confirmResults.rowCount == 0) {
      return res.status(404).json({ result: "Error confirming flight" });
    }

    return res.status(200).json({ result: "Success" });
  } catch (e) {
    console.log(e.message);
    return res
      .status(500)
      .json({ result: "Error confirming flight: " + e.message });
  }
});

/**
 * This PUT endpoint will confirm a hotel
 */
app.put("/api/confirm-hotel", requireAuth, async (req, res) => {
  const { hotelID } = req.body;

  if (hotelID == "") {
    return res.status(400).send("Error: ID cannot be empty");
  }

  const confirmQuery = `
    UPDATE trip_hotel
    SET confirmed = $1
    WHERE id = $2
  `;

  try {
    const confirmValues = [true, hotelID];

    const confirmResults = await pool.query(confirmQuery, confirmValues);

    if (confirmResults.rowCount == 0) {
      return res.status(404).json({ result: "Error confirming hotel" });
    }

    return res.status(200).json({ result: "Success" });
  } catch (e) {
    return res
      .status(500)
      .json({ result: "Error confirming hotel: " + e.message });
  }
});

/**
 * This PUT endpoint will confirm an itinerary
 */
app.put("/api/confirm-itinerary", requireAuth, async (req, res) => {
  const { itineraryID } = req.body;

  if (itineraryID == "") {
    return res.status(400).send("Error: ID cannot be empty");
  }

  const confirmQuery = `
    UPDATE trip_itinerary
    SET confirmed = $1
    WHERE id = $2
  `;

  try {
    const confirmValues = [true, itineraryID];

    const confirmResults = await pool.query(confirmQuery, confirmValues);

    if (confirmResults.rowCount == 0) {
      return res.status(404).json({ result: "Error confirming itinerary" });
    }

    return res.status(200).json({ result: "Success" });
  } catch (e) {
    return res
      .status(500)
      .json({ result: "Error confirming itinerary: " + e.message });
  }
});

/**
 * This GET request returns the itinerary items that match the trip ID
 */
app.get("/api/itinerary/:tripID", async (req, res) => {
  const { tripID } = req.params;

  try {
    const query = `
        SELECT *
        FROM trip_itinerary
        WHERE trip_id = $1`;

    const tripItinerary = await pool.query(query, [tripID]);

    return res.status(200).json(tripItinerary.rows);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

/**
 * This PUT endpoint will confirm an expense
 */
app.put("/api/confirm-expense", requireAuth, async (req, res) => {
  const { expenseID, confirmed_date, tripID, amount, split } = req.body;

  if (expenseID == "" || confirmed_date == "") {
    return res.status(400).send("Error: ID and date cannot be empty");
  }

  const confirmQuery = `
    UPDATE expected_expenses
    SET confirmed = $1,
        confirmed_date = $2
    WHERE expense_id = $3
  `;

  try {
    const confirmValues = [true, confirmed_date, expenseID];

    const confirmResults = await pool.query(confirmQuery, confirmValues);

    if (confirmResults.rowCount == 0) {
      return res.status(404).json({ result: "Error confirming expense" });
    }

    if (split == "own") {
      const updateSavingsFunds = `
        UPDATE savings_funds
        SET amount = amount - $1
        WHERE owner_id = $2
          AND amount > $3
      `;

      const updateSavingsValues = [amount, req.user.id, amount];

      const updateResult = await pool.query(
        updateSavingsFunds,
        updateSavingsValues
      );

      console.log(updateResult);
    } else {
      const updateSavingsFunds = `
        UPDATE savings_funds
        SET amount = amount - $1
        WHERE trip_id = $2
          AND amount > $3
      `;

      const updateSavingsValues = [amount, tripID, amount];

      const updateResult = await pool.query(
        updateSavingsFunds,
        updateSavingsValues
      );

      console.log(updateResult);
    }

    return res.status(200).json({ result: "Success" });
  } catch (e) {
    return res.status(500).json({ result: "Error confirming expense: " + e });
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

    if (tripInvitationResult.rows.length === 0) {
      return res.status(500).send("Error rejecting invitation");
    }

    return res.status(200).json({ result: "Trip rejected" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/**
 * This GET request returns up to 10 notifications for the logged in user
 */
app.get("/api/notifications", requireAuth, async (req, res) => {
  try {
    const query = `
      SELECT *
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 10`;

    const notifResult = await pool.query(query, [req.user.id]);

    if (notifResult.rowCount == 0) {
      return res.status(204).json({ result: [] });
    }

    return res.status(200).json(notifResult.rows);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

/**
 * This PUT request marks all notifs as read for the logged in user
 */
app.put("/api/allnotifications", requireAuth, async (req, res) => {
  try {
    const query = `
      UPDATE notifications
      SET
        read = $1
      WHERE user_id = $2`;

    const notifResult = await pool.query(query, [true, req.user.id]);

    if (notifResult.rowCount == 0) {
      return res.status(204).json({ result: [] });
    }

    return res.status(200).json(notifResult.rowCount);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

/**
 * This PUT request will mark one notif as read for the logged in user
 */
app.put("/api/notifications", requireAuth, async (req, res) => {
  const { notifID } = req.body;

  if (!notifID || notifID == "") {
    return res.status(400).json({ error: "Notification ID cannot be empty" });
  }

  try {
    const query = `
      UPDATE notifications
      SET
        read = $1
      WHERE id = $2`;

    const notifResult = await pool.query(query, [true, notifID]);

    if (notifResult.rowCount == 0) {
      return res.status(204).json({ result: [] });
    }

    return res.status(200).json(notifResult.rowCount);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

/**
 * This function handles sending email invitations to members via MailerSend
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
      <a href="https://wanderfunds-frontend.onrender.com/trip/accept/${invitationID}"
         style="display:inline-block; padding:12px 20px; margin-top:10px;
                background-color:#8ebed8; color:#fff; text-decoration:none;
                border-radius:6px; font-weight:bold;">
        Accept Invitation
      </a>
      <a href="https://wanderfunds-frontend.onrender.com/trip/reject/${invitationID}"
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
