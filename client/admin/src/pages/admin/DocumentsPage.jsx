// client-admin/src/pages/DocumentsPage.js
import { useState, useEffect } from "react";
import { FileText, Upload, Trash2, Download, AlertCircle } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import shared document API
import { documentAPI } from "../../services/documentApi";

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all documents
  const fetchDocuments = async () => {
    try {
      const res = await documentAPI.getAll();
      setDocuments(res.data.data);
    } catch (err) {
      toast.error("Failed to load documents");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Handle Upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.warn("Please enter a document title");
      return;
    }
    if (!file) {
      toast.warn("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    setLoading(true);
    try {
      await documentAPI.upload(formData);
      toast.success("Document uploaded successfully!");
      setTitle("");
      setFile(null);
      e.target.reset(); // Reset file input
      fetchDocuments();
    } catch (err) {
      const msg = err.response?.data?.msg || "Upload failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;

    try {
      await documentAPI.delete(id);
      toast.info("Document deleted");
      fetchDocuments();
    } catch (err) {
      toast.error("Failed to delete document");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ToastContainer position="top-right" theme="dark" autoClose={3000} />

      {/* Header */}
      <h2 className="text-4xl font-extrabold text-white mb-8 flex items-center gap-4">
        <FileText size={44} className="text-cyan-400 drop-shadow-lg" />
        Manage <span className="text-teal-400">Documents</span>
      </h2>

      {/* Upload Card */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-10 border border-white/20 shadow-2xl shadow-cyan-500/20">
        <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
          <Upload size={28} className="text-teal-400" />
          Upload New Document
        </h3>

        <form
          onSubmit={handleUpload}
          className="grid sm:grid-cols-3 gap-5 items-end"
        >
          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Document Title
            </label>
            <input
              type="text"
              placeholder="e.g., Project Report Format 2025"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/30 text-white placeholder-white/50 focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition"
              required
            />
          </div>

          <div>
            <label className="block text-white/90 text-sm font-medium mb-2">
              Select File
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-white/80 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gradient-to-r file:from-cyan-500 file:to-teal-500 file:text-white hover:file:from-cyan-600 hover:file:to-teal-600 cursor-pointer transition"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-extrabold rounded-xl transition-all shadow-lg shadow-cyan-500/50 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Upload size={22} />
            {loading ? "Uploading..." : "Upload Document"}
          </button>
        </form>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {documents.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <AlertCircle size={60} className="mx-auto text-white/30 mb-4" />
            <p className="text-xl text-white/60">No documents uploaded yet</p>
            <p className="text-white/40 mt-2">
              Upload your first document to get started!
            </p>
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc._id}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/20 hover:bg-white/15 transition-all shadow-lg"
            >
              <div className="flex items-start gap-5 flex-1">
                <div className="p-3 bg-teal-500/20 rounded-xl">
                  <FileText size={40} className="text-teal-400" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">{doc.title}</h4>
                  <p className="text-sm text-white/70 mt-1">{doc.fileName}</p>
                  <p className="text-xs text-white/50 mt-2">
                    Uploaded on:{" "}
                    {new Date(doc.uploadedAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  href={`http://localhost:5000/${doc.filePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-green-600 hover:bg-green-700 rounded-xl transition shadow-lg"
                  title="Download"
                >
                  <Download size={22} />
                </a>
                <button
                  onClick={() => handleDelete(doc._id)}
                  className="p-4 bg-red-600 hover:bg-red-700 rounded-xl transition shadow-lg"
                  title="Delete"
                >
                  <Trash2 size={22} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;
