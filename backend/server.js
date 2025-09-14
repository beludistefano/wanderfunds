require('dotenv').config();
const express = require('express');

const pool = require('./db.js');

const app = express();
const port = process.env.PORT;

// Demo user with mariabelendistefano@gmail.com email
const DEMO_USER_ID = "c8379535-2cd7-4248-8c45-1c09ebac140f"


/**
 * This GET request returns all trips where the user has a role in
 */
app.get('/api/trips', async (req, res) => {
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
        WHERE r.user_id = $1`

        const tripsResult = await pool.query(query, [DEMO_USER_ID]);
        
        res.send(tripsResult.rows)

    } catch (err) {
        console.error('Error fetching trips:', err);
        res.status(500).send('Server error');
    }
});




app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});