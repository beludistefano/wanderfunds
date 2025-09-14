require('dotenv').config();
const express = require('express');

const pool = require('./db.js');

const app = express();
const port = process.env.PORT;

// Demo user with mariabelendistefano@gmail.com email
const DEMO_USER_ID = "c8379535-2cd7-4248-8c45-1c09ebac140f"

/*
pool.query('SELECT * FROM users WHERE id = $1', [1])
*/

app.get('/api/trips', async (req, res) => {
try {
    const tripsResult = await pool.query('SELECT * FROM trips WHERE ownerid = $1', [DEMO_USER_ID]);
    
    if(tripsResult.rows.length > 0){
        const tripIDs = tripsResult.rows.map((t) => {
            return t.tripid
        })
        
        try{
            const userRoles = await pool.query('SELECT * FROM user_role WHERE user_id = $1 AND tripid = ANY($2)', [DEMO_USER_ID, tripIDs])

            res.json({
                trips: tripsResult.rows,
                roles: userRoles.rows
            });

        } catch (e){
            console.error('Error fetching roles:', e);
            res.status(500).send('Server error roles' + e);
        }
    } else {
        res.json(tripsResult.rows);
    }
  } catch (err) {
    console.error('Error fetching trips:', err);
    res.status(500).send('Server error');
  }
});




app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});