import Request from "../models/RequestModel.js";

// ⭐ CREATE REQUEST (Student)
export const createRequest = async (req, res) => {
  try {
    const studentId = req.student.id;
    const { type, message } = req.body;

    if (!type || !message) {
      return res.status(400).json({ message: "Type and message are required" });
    }

    const request = await Request.create({
      student: studentId,
      type,
      message,
    });

    res.status(201).json({ message: "Request created successfully", request });
  } catch (err) {
    console.error("Create request error:", err);
    res.status(500).json({ message: "Failed to create request." });
  }
};

// ⭐ GET STUDENT'S OWN REQUESTS
export const getMyRequests = async (req, res) => {
  try {
    const studentId = req.student.id;
    const requests = await Request.find({ student: studentId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ requests });
  } catch (err) {
    console.error("Fetch requests error:", err);
    res.status(500).json({ message: "Failed to fetch requests." });
  }
};

// ⭐ UPDATE REQUEST (Student)
export const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, message } = req.body;

    const request = await Request.findOne({ _id: id, student: req.student.id });
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.type = type || request.type;
    request.message = message || request.message;

    await request.save();
    res.status(200).json({ message: "Request updated successfully", request });
  } catch (err) {
    console.error("Update request error:", err);
    res.status(500).json({ message: "Failed to update request." });
  }
};

// ⭐ DELETE REQUEST (Student)
export const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findOneAndDelete({
      _id: id,
      student: req.student.id,
    });
    if (!request) return res.status(404).json({ message: "Request not found" });

    res.status(200).json({ message: "Request deleted successfully" });
  } catch (err) {
    console.error("Delete request error:", err);
    res.status(500).json({ message: "Failed to delete request." });
  }
};

// ⭐ GET ALL REQUESTS (Admin)
export const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate("student", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ requests });
  } catch (err) {
    console.error("Fetch all requests error:", err);
    res.status(500).json({ message: "Failed to fetch requests." });
  }
};

// ⭐ DELETE REQUEST (Admin)
export const deleteRequestByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findByIdAndDelete(id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    res.status(200).json({ message: "Request deleted by admin successfully" });
  } catch (err) {
    console.error("Admin delete request error:", err);
    res.status(500).json({ message: "Failed to delete request." });
  }
};

// ⭐ UPDATE REQUEST STATUS (Admin)
export const updateRequestStatusByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate incoming status against enum values
    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const request = await Request.findById(id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = status;
    await request.save();

    res.status(200).json({
      message: `Request ${status} successfully`,
      request,
    });
  } catch (err) {
    console.error("Admin update request status error:", err.stack || err);
    res.status(500).json({ message: "Failed to update request status." });
  }
};
