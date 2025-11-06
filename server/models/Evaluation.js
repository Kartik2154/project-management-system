import mongoose from "mongoose";

const evaluationSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
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
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guide",
      default: null,
    },
  },
  { timestamps: true }
);

const Evaluation = mongoose.model("Evaluation", evaluationSchema);
export default Evaluation;
