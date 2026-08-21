const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const userRoutes = require("./routes/userRoutes");
const patientRoutes = require("./routes/patientRoutes");
const ecgRoutes = require("./routes/ecgRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const modelInfoRoutes = require("./routes/modelInfoRoutes");

const app = express();

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/*
|--------------------------------------------------------------------------
| Test Route
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {

    res.status(200).json({
        success: true,
        message: "AI ECG Backend Running Successfully"
    });

});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use("/api/users", userRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/ecg", ecgRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/models", modelInfoRoutes);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: "Route Not Found"

    });

});

module.exports = app;