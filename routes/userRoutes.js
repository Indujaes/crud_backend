const express = require("express");
const router = express.Router();
const { getAllUsers, getSingleUserById, addUser, updateUser, deleteUser } = require("../controller/userControllers");
const { upload } = require("../utils/upload_image");

router.get("/", getAllUsers);
router.get("/:Id", getSingleUserById);
router.post("/", upload.single("photo"), addUser);
router.put("/:Id", upload.single("photo"),updateUser);
router.delete("/:Id", deleteUser);


module.exports = router;

