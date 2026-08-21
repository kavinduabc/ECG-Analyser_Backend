const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

const PYTHON_API_URL = process.env.PYTHON_API_URL || "http://localhost:8000";

/*
|--------------------------------------------------------------------------
| sendECGForPrediction
|--------------------------------------------------------------------------
| Sends .hea and .dat files to the Python AI model server and returns
| the structured prediction result.
|
| Expected Python API response shape:
| {
|   disease: "Normal Sinus Rhythm",
|   confidence: 98.63,
|   probabilities: { "Normal": 98.63, "AFib": 0.62, ... },
|   rawOutput: [0.9863, 0.0062, ...],
|   processingTime: 0.452,
|   modelName: "CNN + BiLSTM + Mish",
|   modelVersion: "1.0"
| }
|--------------------------------------------------------------------------
*/

async function sendECGForPrediction(heaAbsPath, datAbsPath) {
    const form = new FormData();

    form.append("hea_file", fs.createReadStream(heaAbsPath), {
        filename: path.basename(heaAbsPath),
        contentType: "application/octet-stream",
    });

    form.append("dat_file", fs.createReadStream(datAbsPath), {
        filename: path.basename(datAbsPath),
        contentType: "application/octet-stream",
    });

    try {
        const response = await axios.post(`${PYTHON_API_URL}/predict`, form, {
            headers: {
                ...form.getHeaders(),
            },
            timeout: 60000, // 60s timeout for model inference
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        // If Python service is unavailable, return a mock result so the
        // rest of the pipeline still works during development.
        if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
            console.warn("[AI Service] Python model server not reachable — using mock prediction.");
            return {
                success: true,
                isMock: true,
                data: getMockPrediction(),
            };
        }

        return {
            success: false,
            error: error.response?.data?.detail || error.message,
        };
    }
}

/*
|--------------------------------------------------------------------------
| getMockPrediction
|--------------------------------------------------------------------------
| Returns a realistic mock prediction when the Python service is offline.
| Useful during frontend/backend development without needing the ML server.
|--------------------------------------------------------------------------
*/

function getMockPrediction() {
    return {
        disease: "Normal ECG (NORM)",
        description: "No significant abnormality detected. Normal sinus rhythm.",
        confidence: 94.27,
        probabilities: {
            "Normal ECG (NORM)":            94.27,
            "Myocardial Infarction (MI)":    3.18,
            "ST/T-wave Change (STTC)":       1.72,
            "Conduction Disturbance (CD)":   0.83,
        },
        rawOutput: [0.9427, 0.0318, 0.0172, 0.0083],
        processingTime: 0.382,
        modelName: "CNN + Mish + BiLSTM",
        modelVersion: "1.0",
    };
}

module.exports = { sendECGForPrediction };
