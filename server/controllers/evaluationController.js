// controllers/evaluationController.js
import Evaluation from "../models/Evaluation.js";
import EvaluationParameter from "../models/evaluationParameter.js";
import Group from "../models/group.js";

export const getEvaluationParameters = async (req, res) => {
  try {
    const params = await EvaluationParameter.find().sort({ order: 1 });
    res.json({ success: true, data: params });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectEvaluationById = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate("students", "name enrollmentNumber _id")
      .select("projectTitle projectTechnology status students");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json({
      success: true,
      data: group, // बस पूरा group भेज दो – student list आएगी!
    });
  } catch (error) {
    console.error("getProjectEvaluationById error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const saveEvaluation = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { evaluations } = req.body;

    await Evaluation.deleteMany({ group: groupId });

    if (evaluations && evaluations.length > 0) {
      const docs = evaluations.map((e) => ({
        group: groupId,
        student: e.student,
        parameter: e.parameter,
        marks: Number(e.marks),
        evaluatedBy: req.user._id,
      }));
      await Evaluation.insertMany(docs);
    }

    await Group.findByIdAndUpdate(groupId, { status: "Completed" });

    res.json({ success: true, message: "Evaluation saved successfully!" });
  } catch (error) {
    console.error("saveEvaluation ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
