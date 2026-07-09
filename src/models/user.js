
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        userID: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        designation: {
            type: String,
            required: true
        },
        department: {
            type: String,
            required: true
        },
        profilePicture: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;