const express = require("express");

const {
    upload,
    createUser,
    loginUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} = require("../controllers/userController");

const router = express.Router();

router.post("/", upload.single("profilePicture"), createUser);
router.post("/login", loginUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", upload.single("profilePicture"), updateUser);
router.delete("/:id", deleteUser);

module.exports = router;