const path = require("path");

const ECGRecord = require("../models/ecgRecord");
const Prediction = require("../models/prediction");
const Patient = require("../models/patient");

const { uploadECGFiles, buildECGFilePath, deleteECGFiles } = require("../services/ecgService");
const { sendECGForPrediction } = require("../services/aiService");
const { sendSuccess, sendError } = require("../utils/apiResponse");

/*
|--------------------------------------------------------------------------
| Upload ECG & Trigger Prediction
| POST /api/ecg/upload
|--------------------------------------------------------------------------
*/

async function uploadECG(req, res) {
    try {
        // Validate uploaded files
        if (!req.files || !req.files.heaFile || !req.files.datFile) {
            return sendError(res, 400, "Both .hea and .dat files are required.");
        }

        const { patientId, recordName, notes } = req.body;

        if (!patientId || !recordName) {
            return sendError(res, 400, "patientId and recordName are required.");
        }

        // Verify patient exists
        const patient = await Patient.findById(patientId);
        if (!patient) {
            return sendError(res, 404, "Patient not found.");
        }

        const heaFile = req.files.heaFile[0];
        const datFile = req.files.datFile[0];

        const heaPath = buildECGFilePath(heaFile.filename);
        const datPath = buildECGFilePath(datFile.filename);

        // ── 1. Create ECG Record in DB ──────────────────────────────────
        const ecgRecord = await ECGRecord.create({
            patient: patientId,
            uploadedBy: req.user.userId,
            recordName: recordName.trim(),
            heaFile: heaPath,
            datFile: datPath,
            notes: notes || "",
            uploadStatus: "Processing",
        });

        // ── 2. Call AI Model Service ────────────────────────────────────
        const heaAbsPath = path.join(__dirname, "..", heaFile.path || heaPath);
        const datAbsPath = path.join(__dirname, "..", datFile.path || datPath);

        const aiResult = await sendECGForPrediction(
            path.join(__dirname, "..", heaPath),
            path.join(__dirname, "..", datPath)
        );

        // ── 3. Store Prediction ─────────────────────────────────────────
        let savedPrediction = null;

        if (aiResult.success) {
            const pd = aiResult.data;

            savedPrediction = await Prediction.create({
                patient: patientId,
                ecgRecord: ecgRecord._id,
                modelName: pd.modelName || "CNN + BiLSTM + Mish",
                modelVersion: pd.modelVersion || "1.0",
                disease: pd.disease,
                confidence: pd.confidence,
                probabilities: pd.probabilities || {},
                rawOutput: pd.rawOutput || [],
                processingTime: pd.processingTime || 0,
                predictionStatus: "Success",
            });

            // Update ECG record status
            await ECGRecord.findByIdAndUpdate(ecgRecord._id, { uploadStatus: "Completed" });
        } else {
            // Store failure record
            await Prediction.create({
                patient: patientId,
                ecgRecord: ecgRecord._id,
                disease: "Unknown",
                confidence: 0,
                predictionStatus: "Failed",
            });

            await ECGRecord.findByIdAndUpdate(ecgRecord._id, { uploadStatus: "Failed" });
        }

        return sendSuccess(res, 201, "ECG uploaded and analysed successfully.", {
            ecgRecord,
            prediction: savedPrediction,
            isMock: aiResult.isMock || false,
        });

    } catch (error) {
        return sendError(res, 500, "Error uploading ECG record.", error.message);
    }
}

/*
|--------------------------------------------------------------------------
| Get All ECG Records
| GET /api/ecg
|--------------------------------------------------------------------------
*/

async function getECGRecords(req, res) {
    try {
        const records = await ECGRecord.find()
            .sort({ createdAt: -1 })
            .populate("patient", "patientID name age sex")
            .populate("uploadedBy", "userID name designation");

        return sendSuccess(res, 200, "ECG records fetched successfully.", {
            count: records.length,
            records,
        });
    } catch (error) {
        return sendError(res, 500, "Error fetching ECG records.", error.message);
    }
}

/*
|--------------------------------------------------------------------------
| Get Single ECG Record with its Prediction
| GET /api/ecg/:id
|--------------------------------------------------------------------------
*/

async function getECGRecordById(req, res) {
    try {
        const record = await ECGRecord.findById(req.params.id)
            .populate("patient", "patientID name age sex weight")
            .populate("uploadedBy", "userID name designation department");

        if (!record) {
            return sendError(res, 404, "ECG record not found.");
        }

        // Also fetch linked prediction
        const prediction = await Prediction.findOne({ ecgRecord: record._id });

        return sendSuccess(res, 200, "ECG record fetched successfully.", {
            record,
            prediction,
        });
    } catch (error) {
        return sendError(res, 500, "Error fetching ECG record.", error.message);
    }
}

/*
|--------------------------------------------------------------------------
| Delete ECG Record (+ files from disk)
| DELETE /api/ecg/:id
|--------------------------------------------------------------------------
*/

async function deleteECGRecord(req, res) {
    try {
        const record = await ECGRecord.findById(req.params.id);

        if (!record) {
            return sendError(res, 404, "ECG record not found.");
        }

        // Delete linked predictions first
        await Prediction.deleteMany({ ecgRecord: record._id });

        // Delete files from disk
        deleteECGFiles(record.heaFile, record.datFile);

        // Delete DB record
        await ECGRecord.findByIdAndDelete(req.params.id);

        return sendSuccess(res, 200, "ECG record and associated files deleted successfully.");
    } catch (error) {
        return sendError(res, 500, "Error deleting ECG record.", error.message);
    }
}

module.exports = {
    uploadECGFiles,
    uploadECG,
    getECGRecords,
    getECGRecordById,
    deleteECGRecord,
};
