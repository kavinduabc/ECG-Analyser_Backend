const mongoose = require("mongoose");

const modelInfoSchema = new mongoose.Schema(
  {
    modelName: {
      type: String,
      required: true,
    },

    version: {
      type: String,
      required: true,
    },

    accuracy: Number,

    precision: Number,

    recall: Number,

    f1Score: Number,

    dataset: {
      type: String,
      default: "PTB-XL",
    },

    inputShape: {
      type: String,
      default: "(5000,12)",
    },

    classes: [
      {
        type: String,
      },
    ],

    description: String,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ModelInfo", modelInfoSchema);