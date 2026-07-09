
const bcrypt = require("bcryptjs");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const User = require("../models/user");

const profilePictureDir = path.join(__dirname, "..", "uploads", "profilePictures");

const storage = multer.diskStorage({
    destination(req, file, cb) {
        if (!fs.existsSync(profilePictureDir)) {
            fs.mkdirSync(profilePictureDir, { recursive: true });
        }

        cb(null, profilePictureDir);
    },
    filename(req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

function buildProfilePicturePath(file) {
    return path.join("uploads", "profilePictures", file.filename).replace(/\\/g, "/");
}

function sanitizeUser(user) {
    if (!user) {
        return user;
    }

    const plainUser = user.toObject ? user.toObject() : { ...user };
    delete plainUser.password;
    return plainUser;
}

function createAuthToken(user) {
    return require("jsonwebtoken").sign(
        {
            userId: user._id.toString(),
            userID: user.userID,
            name: user.name
        },
        process.env.JWT_SECRET || "ecg-backend-secret",
        { expiresIn: "7d" }
    );
}

async function createUser(req, res) {
    try {
        const data = { ...req.body };

        if (req.file) {
            data.profilePicture = buildProfilePicturePath(req.file);
        }

        const requiredFields = ["userID", "name", "password", "designation", "department", "profilePicture"];
        const missingFields = requiredFields.filter((field) => !data[field] || String(data[field]).trim() === "");

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(", ")}`
            });
        }

        const existingUser = await User.findOne({ userID: data.userID });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "UserID already exists"
            });
        }

        data.password = await bcrypt.hash(data.password, 10);

        const savedUser = await User.create(data);

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: sanitizeUser(savedUser)
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error creating user",
            error: error.message
        });
    }
}

async function loginUser(req, res) {
    try {
        const { userID, password } = req.body;

        if (!userID || !password) {
            return res.status(400).json({
                success: false,
                message: "userID and password are required"
            });
        }

        const user = await User.findOne({ userID });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = createAuthToken(user);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: sanitizeUser(user)
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error logging in",
            error: error.message
        });
    }
}

async function getUsers(req, res) {
    try {
        const users = await User.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: users.length,
            users: users.map(sanitizeUser)
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message
        });
    }
}

async function getUserById(req, res) {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user: sanitizeUser(user)
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching user",
            error: error.message
        });
    }
}

async function updateUser(req, res) {
    try {
        const data = { ...req.body };

        if (req.file) {
            data.profilePicture = buildProfilePicturePath(req.file);
        }

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, data, {
            new: true,
            runValidators: true
        });

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: sanitizeUser(updatedUser)
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error updating user",
            error: error.message
        });
    }
}

async function deleteUser(req, res) {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error deleting user",
            error: error.message
        });
    }
}

module.exports = {
    upload,
    createUser,
    loginUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
};