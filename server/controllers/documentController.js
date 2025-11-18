// server/controllers/documentController.js
import Document from "../models/Document.js";
import fs from "fs";
import path from "path";

// Upload Document
export const uploadDocument = async (req, res) => {
  try {
    const { title } = req.body;
    if (!req.file) {
      return res.status(400).json({ success: false, msg: "No file uploaded" });
    }

    const newDoc = new Document({
      title,
      fileName: req.file.originalname,
      filePath: req.file.path, // e.g., uploads/123456789.pdf
    });

    await newDoc.save();

    res.status(201).json({
      success: true,
      data: newDoc,
      msg: "Document uploaded successfully",
    });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// Get All Documents
export const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.find().sort({ uploadedAt: -1 });
    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};

// Delete Document
export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res
        .status(404)
        .json({ success: false, msg: "Document not found" });
    }

    // Delete file from server
    if (fs.existsSync(doc.filePath)) {
      fs.unlinkSync(doc.filePath);
    }

    await doc.deleteOne();

    res.status(200).json({
      success: true,
      msg: "Document deleted successfully",
    });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ success: false, msg: "Server error" });
  }
};
