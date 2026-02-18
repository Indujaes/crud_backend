const { Pool } = require("pg");

const db = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false }
});

db.connect()
  .then(() => console.log("PostgreSQL connected ✅"))
  .catch((err) => console.error("PostgreSQL connection error ❌", err));

module.exports = db;