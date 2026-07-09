const express = require("express");
const requireAuth = require("../middleware/authMiddleware");

const {
    createPatient,
    getPatients,
    getPatientById,
    updatePatient,
    deletePatient
} = require("../controllers/patientController");

const router = express.Router();

router.post("/", requireAuth, createPatient);
router.get("/", getPatients);
router.get("/:id", getPatientById);
router.put("/:id", requireAuth, updatePatient);
router.delete("/:id", requireAuth, deletePatient);

module.exports = router;