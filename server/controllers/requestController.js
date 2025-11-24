import Request from "../models/RequestModel.js";
import Notification from "../models/Notification.js";

// ⭐ CREATE NEW REQUEST
export const createRequest = async (req, res) => {
  try {
    const studentId = req.student._id; // ✅ FIXED
    const { type, message } = req.body;

    if (!type || !message) {
      return res.status(400).json({ message: "Type and message are required" });
    }

    const request = await Request.create({
      student: studentId,
      type,
      message,
    });

    await Notification.create({
      type: "request",
      message:
        type === "admin"
          ? message // 🔥 using user’s message
          : message,
      isRead: false,
    });

    return res.status(201).json({
      message: "Request created successfully",
      request,
    });
  } catch (err) {
    console.error("Create request error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ⭐ FETCH STUDENT’S OWN REQUESTS
export const getMyRequests = async (req, res) => {
  try {
    const studentId = req.student._id; // ✅ FIXED

    const requests = await Request.find({ student: studentId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ requests });
  } catch (err) {
    console.error("Fetch requests error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
