import Evaluation from "../models/Evaluation.js";
import EvaluationParameter from "../models/evaluationParameter.js";
import Group from "../models/group.js";
import ProjectEvaluation from "../models/projectEvaluation.js";

// Get all evaluation parameters, sorted by order
export const getEvaluationParameters = async (req, res) => {
  try {
    const params = await EvaluationParameter.find().sort({ order: 1 });
    res.json({ success: true, data: params });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get group and its students info by groupId, assembling students array
export const getProjectEvaluationById = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate("students", "name enrollmentNumber _id")
      .populate({
        path: "membersSnapshot",
        populate: {
          path: "studentRef",
          select: "name enrollmentNumber _id",
        },
      })
      .select("projectTitle projectTechnology status students membersSnapshot");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const students =
      group.membersSnapshot && group.membersSnapshot.length > 0
        ? group.membersSnapshot.map((m) => ({
            _id: m.studentRef?._id,
            name: m.studentRef?.name || "Unknown",
            enrollmentNumber: m.studentRef?.enrollmentNumber || "N/A",
          }))
        : group.students.map((s) => ({
            _id: s._id,
            name: s.name,
            enrollmentNumber: s.enrollmentNumber,
          }));

    const evaluations = await ProjectEvaluation.find({ projectId: groupId })
      .populate("studentId", "name enrollmentNumber")
      .populate("parameterId", "name");

    res.json({
      success: true,
      data: {
        ...group.toObject(),
        students, // override with constructed students array
        evaluations, // includes each evaluation with student and parameter info
      },
    });
  } catch (error) {
    console.error("getProjectEvaluationById error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get existing project evaluations (ProjectEvaluation collection) for a group
export const getProjectEvaluationsByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;

    const evaluations = await ProjectEvaluation.find({ projectId: groupId })
      .populate("studentId", "name enrollmentNumber")
      .populate("parameterId", "name");

    res.status(200).json({
      success: true,
      data: evaluations,
    });
  } catch (err) {
    console.error("Error fetching project evaluations:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error while fetching evaluations",
    });
  }
};

// Save all project evaluations for a group (individual student marks)

export const saveAllProjectEvaluations = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { evaluations } = req.body;

    if (!Array.isArray(evaluations) || evaluations.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No evaluations provided",
      });
    }

    // Group evaluations by studentId
    const grouped = evaluations.reduce((acc, e) => {
      if (!acc[e.student]) acc[e.student] = [];
      acc[e.student].push({ parameterId: e.parameter, marks: Number(e.marks) });
      return acc;
    }, {});

    const upsertPromises = Object.entries(grouped).map(([studentId, evals]) =>
      ProjectEvaluation.findOneAndUpdate(
        { projectId: groupId, studentId },
        {
          $set: {
            evaluations: evals,
            evaluatedBy: req.admin._id,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    );

    await Promise.all(upsertPromises);

    await Group.findByIdAndUpdate(groupId, { status: "Completed" });

    res.json({
      success: true,
      message: "All evaluations saved successfully!",
    });
  } catch (err) {
    console.error("Error saving project evaluations:", err);
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};
