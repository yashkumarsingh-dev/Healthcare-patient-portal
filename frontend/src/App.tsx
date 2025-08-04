import React, { useState, useEffect } from "react";
import {
  Upload,
  Download,
  Trash2,
  FileText,
  Plus,
  Search,
  Calendar,
  HardDrive,
} from "lucide-react";
import { documentApi, Document } from "./services/api";
import { formatFileSize, formatDate } from "./lib/utils";
import LoadingSpinner from "./components/LoadingSpinner";
import EmptyState from "./components/EmptyState";
import Footer from "./components/Footer";
import Notification from "./components/Notification";

interface Message {
  type: "success" | "error";
  text: string;
}

function App() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await documentApi.getDocuments();
      if (response.success && response.data) {
        setDocuments(response.data);
      }
    } catch (error) {
      showMessage("error", "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.type !== "application/pdf") {
      showMessage("error", "Please select a PDF file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      showMessage("error", "File size must be less than 10MB");
      return;
    }
    setSelectedFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showMessage("error", "Please select a file to upload");
      return;
    }

    setUploading(true);
    try {
      const response = await documentApi.uploadFile(selectedFile);
      if (response.success) {
        showMessage("success", "File uploaded successfully");
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById(
          "file-input"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        loadDocuments();
      } else {
        showMessage("error", response.message || "Upload failed");
      }
    } catch (error) {
      showMessage("error", "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      await documentApi.downloadDocument(document.id, document.originalName);
    } catch (error) {
      showMessage("error", "Failed to download file");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const response = await documentApi.deleteDocument(id);
      if (response.success) {
        showMessage("success", "Document deleted successfully");
        loadDocuments();
      } else {
        showMessage("error", response.message || "Delete failed");
      }
    } catch (error) {
      showMessage("error", "Failed to delete document");
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.originalName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 relative">
          {/* Theme Toggle removed as per user request */}

          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 rounded-full mb-6 shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
            Healthcare Patient Portal
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Securely upload, manage, and access your medical documents with ease
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-700/50">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
                  Total Documents
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {documents.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-700/50">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-500/20 rounded-lg">
                <HardDrive className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
                  Storage Used
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatFileSize(totalSize)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-100 dark:border-slate-700/50">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
                  Last Upload
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {documents.length > 0
                    ? formatDate(documents[0].uploadDate).split(",")[0]
                    : "None"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <Notification
            type={message.type}
            message={message.text}
            onClose={() => setMessage(null)}
          />
        )}

        {/* Upload Section */}
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-gray-100 dark:border-slate-700/50">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-gray-800 dark:text-white">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
              <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            Upload Medical Document
          </h2>

          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
              dragActive
                ? "border-blue-400 bg-blue-50 dark:bg-blue-500/10"
                : "border-gray-300 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-slate-700/30"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}>
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-blue-100 rounded-full">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center justify-center gap-4">
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="file-input"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium">
                  Choose File
                </label>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2">
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Upload
                    </>
                  )}
                </button>
              </div>

              {selectedFile && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-500/10 rounded-lg border border-green-200 dark:border-green-500/30">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-medium text-green-800 dark:text-green-200">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-700/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-3xl font-bold flex items-center gap-3 text-gray-800 dark:text-white mb-4 md:mb-0">
              <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              Your Documents
            </h2>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64 bg-white dark:bg-slate-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400"
              />
            </div>
          </div>

          {loading ? (
            <LoadingSpinner
              size="lg"
              color="blue"
              text="Loading your documents..."
            />
          ) : filteredDocuments.length === 0 ? (
            <EmptyState
              title={
                searchTerm ? "No documents found" : "No documents uploaded yet"
              }
              description={
                searchTerm
                  ? "Try adjusting your search terms"
                  : "Upload your first medical document above"
              }
              icon={<FileText className="w-12 h-12 text-gray-400" />}
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800/50 dark:to-slate-700/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3
                        className="font-semibold text-gray-900 dark:text-white mb-2 max-w-full cursor-pointer"
                        title={doc.originalName}
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          maxWidth: "100%",
                          whiteSpace: "normal",
                        }}>
                        {doc.originalName}
                      </h3>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500 dark:text-slate-300 flex items-center gap-1">
                          <HardDrive className="w-3 h-3" />
                          {formatFileSize(doc.fileSize)}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(doc.uploadDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(doc)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center gap-2 font-medium">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center gap-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
