import EvaluationParameter from "../models/evaluationParameter.js";
import Group from "../models/group.js";
import Student from "../models/student.js";
import Evaluation from "../models/Evaluation.js"; // model for saving marks

// 🔹 Get all evaluation parameters
export const getEvaluationParameters = async (req, res) => {
  try {
    const parameters = await EvaluationParameter.find().sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: parameters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Save evaluation data
export const saveEvaluation = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { evaluations } = req.body;
    const guideId = req.guide?._id;

    console.log("📩 Received evaluation data:", req.body);

    if (
      !evaluations ||
      !Array.isArray(evaluations) ||
      evaluations.length === 0
    ) {
      return res.status(400).json({ message: "No evaluation data provided" });
    }

    for (const e of evaluations) {
      if (!e.student || !e.parameter) {
        return res.status(400).json({
          message: "Each evaluation must include student and parameter",
        });
      }
    }

    // Save all evaluations
    const saved = await Evaluation.insertMany(
      evaluations.map((e) => ({
        group: groupId,
        guide: guideId,
        student: e.student,
        parameter: e.parameter,
        marks: e.marks,
      }))
    );

    res.status(201).json({ message: "Evaluation saved", data: saved });
  } catch (err) {
    console.error("Error saving evaluation:", err);
    res.status(500).json({
      message: "Failed to save evaluation",
      error: err.message,
    });
  }
};
