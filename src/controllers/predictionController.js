const Prediction = require("../models/prediction");
const { sendSuccess, sendError } = require("../utils/apiResponse");

/*
|--------------------------------------------------------------------------
| Get All Predictions
| GET /api/predictions
|--------------------------------------------------------------------------
*/

async function getPredictions(req, res) {
    try {
        const predictions = await Prediction.find()
            .sort({ createdAt: -1 })
            .populate("patient", "patientID name age sex")
            .populate("ecgRecord", "recordName samplingRate numberOfLeads duration uploadStatus");

        return sendSuccess(res, 200, "Predictions fetched successfully.", {
            count: predictions.length,
            predictions,
        });
    } catch (error) {
        return sendError(res, 500, "Error fetching predictions.", error.message);
    }
}

/*
|--------------------------------------------------------------------------
| Get Single Prediction by ID
| GET /api/predictions/:id
|--------------------------------------------------------------------------
*/

async function getPredictionById(req, res) {
    try {
        const prediction = await Prediction.findById(req.params.id)
            .populate("patient", "patientID name age sex weight")
            .populate("ecgRecord", "recordName samplingRate numberOfLeads duration leadNames heaFile datFile uploadStatus notes");

        if (!prediction) {
            return sendError(res, 404, "Prediction not found.");
        }

        return sendSuccess(res, 200, "Prediction fetched successfully.", { prediction });
    } catch (error) {
        return sendError(res, 500, "Error fetching prediction.", error.message);
    }
}

/*
|--------------------------------------------------------------------------
| Get All Predictions for a Patient
| GET /api/predictions/patient/:patientId
|--------------------------------------------------------------------------
*/

async function getPredictionsByPatient(req, res) {
    try {
        const predictions = await Prediction.find({ patient: req.params.patientId })
            .sort({ createdAt: -1 })
            .populate("ecgRecord", "recordName samplingRate numberOfLeads duration uploadStatus createdAt");

        return sendSuccess(res, 200, "Patient predictions fetched successfully.", {
            count: predictions.length,
            predictions,
        });
    } catch (error) {
        return sendError(res, 500, "Error fetching patient predictions.", error.message);
    }
}

module.exports = {
    getPredictions,
    getPredictionById,
    getPredictionsByPatient,
};
