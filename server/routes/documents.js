import express from "express";
import upload from "../middlewares/upload.js";
import {
  uploadDocument,
  getAllDocuments,
  deleteDocument,
} from "../controllers/documentController.js";

const router = express.Router();

router.post("/upload", upload.single("file"), uploadDocument);
router.get("/", getAllDocuments);
router.delete("/:id", deleteDocument);

export default router;
