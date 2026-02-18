const { Pool } = require("pg");
require("dotenv").config();

// Connection Pool
const db = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    port: process.env.DB_PORT, // PostgreSQL default port
    ssl:{  rejectUnauthorized: false}
});

// Test Connection
(async () => {
    try {
        const client = await db.connect();
        console.log("PostgreSQL Server is running");
        client.release();
    } catch (error) {
        console.error("PostgreSQL connection failed:", error);
    }
})();

module.exports = db;