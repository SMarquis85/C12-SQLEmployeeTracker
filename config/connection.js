const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  // Your port; if not 3306
  port: 3306,
  // Your username
  user: "root",
  // Your password
  password: "SEXiii.bby1985!",
  database: "galactic_empire_db",
});

module.exports = connection;
