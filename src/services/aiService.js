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
        disease: "Normal Sinus Rhythm",
        confidence: 98.63,
        probabilities: {
            Normal: 98.63,
            AFib: 0.62,
            "Myocardial Infarction": 0.41,
            Arrhythmia: 0.18,
            "Other Abnormality": 0.16,
        },
        rawOutput: [0.9863, 0.0062, 0.0041, 0.0018, 0.0016],
        processingTime: 0.452,
        modelName: "CNN + BiLSTM + Mish",
        modelVersion: "1.0",
    };
}

module.exports = { sendECGForPrediction };
