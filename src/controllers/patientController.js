const Patient = require("../models/patient");

async function createPatient(req, res) {
    try {
        const requiredFields = ["patientID", "name", "age", "sex", "weight"];
        const missingFields = requiredFields.filter((field) => req.body[field] === undefined || req.body[field] === null || String(req.body[field]).trim() === "");

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(", ")}`
            });
        }

        const existingPatient = await Patient.findOne({ patientID: req.body.patientID });

        if (existingPatient) {
            return res.status(409).json({
                success: false,
                message: "PatientID already exists"
            });
        }

        const patientData = {
            ...req.body,
            createdBy: req.user ? req.user.userId : undefined
        };

        const patient = await Patient.create(patientData);

        return res.status(201).json({
            success: true,
            message: "Patient created successfully",
            patient
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error creating patient",
            error: error.message
        });
    }
}

async function getPatients(req, res) {
    try {
        const patients = await Patient.find().sort({ createdAt: -1 }).populate("createdBy", "userID name designation department");

        return res.status(200).json({
            success: true,
            count: patients.length,
            patients
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching patients",
            error: error.message
        });
    }
}

async function getPatientById(req, res) {
    try {
        const patient = await Patient.findById(req.params.id).populate("createdBy", "userID name designation department");

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        return res.status(200).json({
            success: true,
            patient
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching patient",
            error: error.message
        });
    }
}

async function updatePatient(req, res) {
    try {
        const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!updatedPatient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        const populatedPatient = await Patient.findById(updatedPatient._id).populate("createdBy", "userID name designation department");

        return res.status(200).json({
            success: true,
            message: "Patient updated successfully",
            patient: populatedPatient
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error updating patient",
            error: error.message
        });
    }
}

async function deletePatient(req, res) {
    try {
        const deletedPatient = await Patient.findByIdAndDelete(req.params.id);

        if (!deletedPatient) {
            return res.status(404).json({
                success: false,
                message: "Patient not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Patient deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error deleting patient",
            error: error.message
        });
    }
}

module.exports = {
    createPatient,
    getPatients,
    getPatientById,
    updatePatient,
    deletePatient
};