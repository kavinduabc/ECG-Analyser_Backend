const express = require("express");

const {
    upload,
    createUser,
    loginUser,
    registerUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} = require("../controllers/userController");

const router = express.Router();

router.post("/register", upload.single("profilePicture"), registerUser);
router.post("/", upload.single("profilePicture"), createUser);
router.post("/login", loginUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", upload.single("profilePicture"), updateUser);
router.delete("/:id", deleteUser);

module.exports = router;