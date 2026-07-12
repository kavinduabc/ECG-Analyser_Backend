const express = require("express");
const requireAuth = require("../middleware/authMiddleware");

const {
    getModels,
    getActiveModel,
    createModel,
    updateModel,
    deleteModel,
} = require("../controllers/modelInfoController");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Model Info Routes
|--------------------------------------------------------------------------
| GET    /api/models          List all registered models
| GET    /api/models/active   Get the currently active model
| POST   /api/models          Register a new model version
| PUT    /api/models/:id      Update model info / set as active
| DELETE /api/models/:id      Remove a model entry
|--------------------------------------------------------------------------
*/

router.get("/active", getActiveModel);
router.get("/", getModels);
router.post("/", requireAuth, createModel);
router.put("/:id", requireAuth, updateModel);
router.delete("/:id", requireAuth, deleteModel);

module.exports = router;
