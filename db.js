const mysql = require("mysql2/promise");
require("dotenv").config();

// Connection String
const db = mysql.createPool({
    host: process.env.DB_HOST, 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Test Connection 
(async() => {
    try {
      const connection = await db.getConnection();
      console.log("MySQL Server is running");
      connection.release();
    } catch (error) {
      console.error("MySql connection failed:", error);
    }
})();

module.exports = db;