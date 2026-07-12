const ModelInfo = require("../models/modelInfo");
const { sendSuccess, sendError } = require("../utils/apiResponse");

/*
|--------------------------------------------------------------------------
| Get All Models
| GET /api/models
|--------------------------------------------------------------------------
*/

async function getModels(req, res) {
    try {
        const models = await ModelInfo.find().sort({ createdAt: -1 });

        return sendSuccess(res, 200, "Models fetched successfully.", {
            count: models.length,
            models,
        });
    } catch (error) {
        return sendError(res, 500, "Error fetching models.", error.message);
    }
}

/*
|--------------------------------------------------------------------------
| Get Currently Active Model
| GET /api/models/active
|--------------------------------------------------------------------------
*/

async function getActiveModel(req, res) {
    try {
        const model = await ModelInfo.findOne({ isActive: true }).sort({ createdAt: -1 });

        if (!model) {
            return sendError(res, 404, "No active model found.");
        }

        return sendSuccess(res, 200, "Active model fetched successfully.", { model });
    } catch (error) {
        return sendError(res, 500, "Error fetching active model.", error.message);
    }
}

/*
|--------------------------------------------------------------------------
| Register a New Model
| POST /api/models
|--------------------------------------------------------------------------
*/

async function createModel(req, res) {
    try {
        const { modelName, version } = req.body;

        if (!modelName || !version) {
            return sendError(res, 400, "modelName and version are required.");
        }

        // If new model is marked active, deactivate all others
        if (req.body.isActive === true || req.body.isActive === "true") {
            await ModelInfo.updateMany({}, { isActive: false });
        }

        const model = await ModelInfo.create(req.body);

        return sendSuccess(res, 201, "Model registered successfully.", { model });
    } catch (error) {
        return sendError(res, 500, "Error registering model.", error.message);
    }
}

/*
|--------------------------------------------------------------------------
| Update Model Info
| PUT /api/models/:id
|--------------------------------------------------------------------------
*/

async function updateModel(req, res) {
    try {
        // If activating this model, deactivate all others first
        if (req.body.isActive === true || req.body.isActive === "true") {
            await ModelInfo.updateMany({}, { isActive: false });
        }

        const model = await ModelInfo.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!model) {
            return sendError(res, 404, "Model not found.");
        }

        return sendSuccess(res, 200, "Model updated successfully.", { model });
    } catch (error) {
        return sendError(res, 500, "Error updating model.", error.message);
    }
}

/*
|--------------------------------------------------------------------------
| Delete a Model
| DELETE /api/models/:id
|--------------------------------------------------------------------------
*/

async function deleteModel(req, res) {
    try {
        const model = await ModelInfo.findByIdAndDelete(req.params.id);

        if (!model) {
            return sendError(res, 404, "Model not found.");
        }

        return sendSuccess(res, 200, "Model deleted successfully.");
    } catch (error) {
        return sendError(res, 500, "Error deleting model.", error.message);
    }
}

module.exports = {
    getModels,
    getActiveModel,
    createModel,
    updateModel,
    deleteModel,
};
