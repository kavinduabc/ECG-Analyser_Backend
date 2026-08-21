const express = require("express");
const requireAuth = require("../middleware/authMiddleware");

const {
    uploadECGFiles,
    uploadECG,
    getECGRecords,
    getECGRecordById,
    deleteECGRecord,
    getECGSignal,
    getExplainableAI,
} = require("../controllers/ecgController");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| ECG Routes
|--------------------------------------------------------------------------
| POST   /api/ecg/upload     Upload ECG files + trigger AI prediction
| GET    /api/ecg            List all ECG records
| GET    /api/ecg/:id        Get a single ECG record with its prediction
| DELETE /api/ecg/:id        Delete ECG record and its files
|--------------------------------------------------------------------------
*/

router.post("/upload", requireAuth, uploadECGFiles, uploadECG);
router.get("/", requireAuth, getECGRecords);
router.get("/:id/signal", requireAuth, getECGSignal);
router.post("/:id/explain", requireAuth, getExplainableAI);
router.get("/:id", requireAuth, getECGRecordById);
router.delete("/:id", requireAuth, deleteECGRecord);

module.exports = router;
