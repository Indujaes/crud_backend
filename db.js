const { Pool } = require("pg");
require("dotenv").config();

// Connection Pool
const db = new Pool({
    host: "dpg-d6aa3drnv86c73bkn290-a",
    user: "empdb_q8lr_user",
    password: "S2dim558ZdUCMBYDjKYJnbo5bnBkHYva",
    database: "empdb_q8lr",
    port: 5432, // PostgreSQL default port
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