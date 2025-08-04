const express = require("express");
const multer = require("multer");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Database setup
const db = new sqlite3.Database(path.join(__dirname, "documents.db"));

// Create documents table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      originalName TEXT NOT NULL,
      fileSize INTEGER NOT NULL,
      uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `doc-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is PDF
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"), false);
    }
  },
});

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// API Routes

// Upload PDF file
app.post("/api/documents/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { filename, originalname, size } = req.file;

    // Save to database
    const stmt = db.prepare(`
      INSERT INTO documents (filename, originalName, fileSize)
      VALUES (?, ?, ?)
    `);

    stmt.run(filename, originalname, size, function (err) {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          message: "Error saving file metadata",
        });
      }

      res.json({
        success: true,
        message: "File uploaded successfully",
        data: {
          id: this.lastID,
          filename: filename,
          originalName: originalname,
          fileSize: size,
          uploadDate: new Date().toISOString(),
        },
      });
    });

    stmt.finalize();
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading file",
    });
  }
});

// Get all documents
app.get("/api/documents", (req, res) => {
  db.all("SELECT * FROM documents ORDER BY uploadDate DESC", (err, rows) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching documents",
      });
    }

    const documents = rows.map((row) => ({
      id: row.id,
      filename: row.filename,
      originalName: row.originalName,
      fileSize: row.fileSize,
      uploadDate: row.uploadDate,
    }));

    res.json({
      success: true,
      data: documents,
    });
  });
});

// Download document
app.get("/api/documents/:id", (req, res) => {
  const documentId = req.params.id;

  db.get("SELECT * FROM documents WHERE id = ?", [documentId], (err, row) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching document",
      });
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const filePath = path.join(uploadsDir, row.filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found on server",
      });
    }

    // Set headers for file download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${row.originalName}"`
    );

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  });
});

// Delete document
app.delete("/api/documents/:id", (req, res) => {
  const documentId = req.params.id;

  db.get("SELECT * FROM documents WHERE id = ?", [documentId], (err, row) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching document",
      });
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const filePath = path.join(uploadsDir, row.filename);

    // Delete file from filesystem
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    db.run("DELETE FROM documents WHERE id = ?", [documentId], function (err) {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          success: false,
          message: "Error deleting document",
        });
      }

      res.json({
        success: true,
        message: "File deleted successfully",
      });
    });
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 10MB.",
      });
    }
  }

  if (error.message === "Only PDF files are allowed") {
    return res.status(400).json({
      success: false,
      message: "Only PDF files are allowed",
    });
  }

  console.error("Server error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err);
    } else {
      console.log("Database connection closed.");
    }
    process.exit(0);
  });
});
