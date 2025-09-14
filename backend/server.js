require('dotenv').config();
const express = require('express');

const pool = require('./db.js');

const app = express();
const port = process.env.PORT;

app.get('/', async (req, res) => {
try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});