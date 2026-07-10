import mongoose from "mongoose";

const modelInfoSchema = new mongoose.Schema(
  {
    modelName: String,

    version: String,

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

export default mongoose.model("ModelInfo", modelInfoSchema);