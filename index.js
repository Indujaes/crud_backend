const express = require("express");
require("dotenv").config();
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const db = require("./db"); //

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 TEMP: Create table
const createTable = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS employee (
        id SERIAL PRIMARY KEY,
        empname VARCHAR(100),
        empage INT,
        empdept VARCHAR(100),
        photo VARCHAR(255)
      )
    `);

    console.log("employee table created");
  } catch (err) {
    console.error(" Table create error:", err.message);
  }
};

createTable(); // 
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({ message: "Working Fine.." });
});

app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});