const mongoose = require("mongoose");

const ecgRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    recordName: {
      type: String,
      required: true,
      trim: true,
    },

    heaFile: {
      type: String,
      required: true,
    },

    datFile: {
      type: String,
      required: true,
    },

    samplingRate: {
      type: Number,
      default: 500,
    },

    totalSamples: {
      type: Number,
      default: 5000,
    },

    numberOfLeads: {
      type: Number,
      default: 12,
    },

    duration: {
      type: Number,
      default: 10,
    },

    leadNames: [
      {
        type: String,
      },
    ],

    uploadStatus: {
      type: String,
      enum: ["Uploaded", "Processing", "Completed", "Failed"],
      default: "Uploaded",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ECGRecord", ecgRecordSchema);