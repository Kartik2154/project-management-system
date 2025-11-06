// models/Evaluation.js
import mongoose from "mongoose";

const evaluationSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    guide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guide",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    parameter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EvaluationParameter",
      required: true,
    },
    marks: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate entries
evaluationSchema.index(
  { group: 1, student: 1, parameter: 1 },
  { unique: true }
);

const Evaluation = mongoose.model("Evaluation", evaluationSchema);
export default Evaluation;
