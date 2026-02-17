const db = require("../db");
const path = require("path");
const fsPromises = require("fs").promises;

//Get all users
const getAllUsers = async (req, res) => {

  try {
    const { page = 1, limit = 2, search } = req.query;
    const offset = (page - 1) * limit;
    let query = "SELECT * FROM employee";
    let countQuery = "SELECT COUNT(*) as total FROM employee";
    let params = [];

    if (search) {
        query += " WHERE empname LIKE ? OR empdept LIKE ?";
        countQuery += " WHERE empname LIKE ? OR empdept LIKE ?";
        params=[`%${search}%`, `%${search}%`];
    }
    query += " LIMIT ? OFFSET ?";
    params.push(+limit, +offset);
    const [users] = await db.query(query, params);
    const [count] = await db.query(countQuery ,search ? [`%${search}%`, `%${search}%`] : []);
    res.json({ users, totalPages: Math.ceil(count[0].total / limit),
      currentPage: +page,

    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Get Single user by id 
const getSingleUserById = async (req, res) => {
   try {
     const Id = req.params.Id;
     if (!Id) {
      return res.status(404).json({ error: "User Id required" });
     }
     const [users] = await db.query("SELECT * FROM employee WHERE Id=?",[Id]);
     console.log(users);
     if(users.length===0){
           return res.status(404).json({ error: "User not found"})
     }
     res.json(users[0]);
   } catch (error) {
    res.status(500).json({ error: error.message });
   }
};

//Add new user
const addUser = async (req, res) => {
  try {
    const { EmpName, EmpAge, EmpDept } = req.body;
    const photo = req.file?req.file.filename : null;
    const [result] = await db.query( "INSERT INTO employee (EmpName, EmpAge, EmpDept, photo) VALUES (?,?,?,?)", [EmpName, EmpAge, EmpDept, photo]);
    res.status(201).json({ Id: result.insertId, EmpName, EmpAge, EmpDept, photo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } 
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { EmpName, EmpAge, EmpDept } = req.body;
    const photo = req.file ? req.file.filename : null;
    await db.query("UPDATE employee SET EmpName = ?, EmpAge = ?, EmpDept = ?, photo = ? WHERE Id = ?", [EmpName, EmpAge,
    EmpDept, photo, req.params.Id]);
    res.status(200).json({ Id: req.params.Id, EmpName, EmpAge, EmpDept, photo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } 
};

//Delete User

const deleteUser =  async(req, res) => {
  try {
    const [users] = await db.query("SELECT photo FROM employee WHERE Id = ?", [req.params.Id]);
    if (users.length === 0) {
      return res.status(404).json({ error: "user not found" });
    }
    const user =  users[0]; //user.photo
    if (user.photo) {
      const photoPath = path.join(__dirname, "../uploads", user.photo); 
      console.log(photoPath);
      
      try{
        await fsPromises.unlink(photoPath);
      } catch (err) {
        console.error("Error deleting photo:", err);
      }
    }
    const [result] = await db.query("DELETE FROM employee WHERE Id = ?", [req.params.Id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not Found "});
    }
    
    res.json({ message: "User delete Successfully "});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllUsers, getSingleUserById, addUser, updateUser, deleteUser };