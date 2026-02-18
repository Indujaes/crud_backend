const db = require("../db");
const path = require("path");
const fsPromises = require("fs").promises;

// ===============================
// ✅ GET ALL USERS (SEARCH + PAGINATION)
// ===============================
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    let params = [];
    let where = "";

    if (search) {
      where = "WHERE empname ILIKE $1 OR empdept ILIKE $1";
      params.push(`%${search}%`);
    }

    const usersQuery = `
      SELECT * FROM employee
      ${where}
      ORDER BY id DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);

    const users = await db.query(usersQuery, params);

    const countQuery = `
      SELECT COUNT(*) FROM employee
      ${where}
    `;

    const countParams = search ? [`%${search}%`] : [];
    const countResult = await db.query(countQuery, countParams);

    res.json({
      users: users.rows,
      totalPages: Math.ceil(countResult.rows[0].count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// ✅ GET SINGLE USER
// ===============================
const getSingleUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "SELECT * FROM employee WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// ✅ ADD USER
// ===============================
const addUser = async (req, res) => {
  try {
    const { empname, empage, empdept } = req.body;
    const photo = req.file ? req.file.filename : null;

    const result = await db.query(
      `INSERT INTO employee (empname, empage, empdept, photo)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [empname, empage, empdept, photo]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// ✅ UPDATE USER
// ===============================
const updateUser = async (req, res) => {
  try {
    const { empname, empage, empdept } = req.body;
    const photo = req.file ? req.file.filename : null;

    const result = await db.query(
      `UPDATE employee
       SET empname=$1, empage=$2, empdept=$3, photo=$4
       WHERE id=$5
       RETURNING *`,
      [empname, empage, empdept, photo, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// ✅ DELETE USER
// ===============================
const deleteUser = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT photo FROM employee WHERE id=$1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    if (user.photo) {
      const photoPath = path.join(__dirname, "../uploads", user.photo);
      try {
        await fsPromises.unlink(photoPath);
      } catch (err) {
        console.error("Photo delete error:", err.message);
      }
    }

    await db.query("DELETE FROM employee WHERE id=$1", [req.params.id]);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ⭐ VERY IMPORTANT
module.exports = {
  getAllUsers,
  getSingleUserById,
  addUser,
  updateUser,
  deleteUser,
};