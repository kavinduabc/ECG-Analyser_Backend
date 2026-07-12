const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    ecgRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ECGRecord",
      required: true,
    },

    modelName: {
      type: String,
      default: "CNN + BiLSTM + Mish",
    },

    modelVersion: {
      type: String,
      default: "1.0",
    },

    disease: {
      type: String,
      required: true,
    },

    confidence: {
      type: Number,
      required: true,
    },

    probabilities: {
      type: Map,
      of: Number,
      default: {},
    },

    rawOutput: {
      type: [Number],
      default: [],
    },

    processingTime: {
      type: Number,
      default: 0,
    },

    predictionStatus: {
      type: String,
      enum: ["Success", "Failed"],
      default: "Success",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Prediction", predictionSchema);