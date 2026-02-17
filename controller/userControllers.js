const db = require("../db"); // This is your pg Pool
const path = require("path");
const fsPromises = require("fs").promises;

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 2, search } = req.query;
    const offset = (page - 1) * limit;

    let query = "SELECT * FROM employee";
    let countQuery = "SELECT COUNT(*) as total FROM employee";
    let params = [];

    if (search) {
      query += " WHERE empname ILIKE $1 OR empdept ILIKE $2";
      countQuery += " WHERE empname ILIKE $1 OR empdept ILIKE $2";
      params = [`%${search}%`, `%${search}%`];
    }

    // Add pagination
    query += search ? " LIMIT $3 OFFSET $4" : " LIMIT $1 OFFSET $2";
    if (search) {
      params.push(+limit, +offset);
    } else {
      params = [+limit, +offset];
    }

    const usersResult = await db.query(query, params);
    const countResult = await db.query(countQuery, search ? [`%${search}%`, `%${search}%`] : []);
    
    res.json({
      users: usersResult.rows,
      totalPages: Math.ceil(countResult.rows[0].total / limit),
      currentPage: +page,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single user by id
const getSingleUserById = async (req, res) => {
  try {
    const Id = req.params.Id;
    if (!Id) {
      return res.status(404).json({ error: "User Id required" });
    }
    const result = await db.query("SELECT * FROM employee WHERE Id = $1", [Id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add new user
const addUser = async (req, res) => {
  try {
    const { EmpName, EmpAge, EmpDept } = req.body;
    const photo = req.file ? req.file.filename : null;

    const result = await db.query(
      "INSERT INTO employee (EmpName, EmpAge, EmpDept, photo) VALUES ($1, $2, $3, $4) RETURNING Id",
      [EmpName, EmpAge, EmpDept, photo]
    );

    res.status(201).json({ Id: result.rows[0].id, EmpName, EmpAge, EmpDept, photo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { EmpName, EmpAge, EmpDept } = req.body;
    const photo = req.file ? req.file.filename : null;

    const result = await db.query(
      "UPDATE employee SET EmpName = $1, EmpAge = $2, EmpDept = $3, photo = $4 WHERE Id = $5 RETURNING *",
      [EmpName, EmpAge, EmpDept, photo, req.params.Id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const result = await db.query("SELECT photo FROM employee WHERE Id = $1", [req.params.Id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];
    if (user.photo) {
      const photoPath = path.join(__dirname, "../uploads", user.photo);
      try {
        await fsPromises.unlink(photoPath);
      } catch (err) {
        console.error("Error deleting photo:", err);
      }
    }

    const deleteResult = await db.query("DELETE FROM employee WHERE Id = $1 RETURNING *", [req.params.Id]);
    if (deleteResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllUsers, getSingleUserById, addUser, updateUser, deleteUser };