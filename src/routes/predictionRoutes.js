const express = require("express");
const requireAuth = require("../middleware/authMiddleware");

const {
    getPredictions,
    getPredictionById,
    getPredictionsByPatient,
} = require("../controllers/predictionController");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Prediction Routes
|--------------------------------------------------------------------------
| GET /api/predictions                        List all predictions
| GET /api/predictions/:id                   Get single prediction (full)
| GET /api/predictions/patient/:patientId    All predictions for a patient
|--------------------------------------------------------------------------
*/

router.get("/", requireAuth, getPredictions);
router.get("/patient/:patientId", requireAuth, getPredictionsByPatient);
router.get("/:id", requireAuth, getPredictionById);

module.exports = router;
