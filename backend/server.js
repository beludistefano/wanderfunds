/*
 * I, Maria Belen Di Stefano, ID 000864409 certify that this material is my original work.
 * No other person's work has been used without due acknowledgement. I have not made my work available to anyone else.
 */

require("dotenv").config();
const app = require("./app");

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
