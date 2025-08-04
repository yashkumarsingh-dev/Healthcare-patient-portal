# Healthcare Patient Portal

A full-stack web application for patients to upload, manage, and download their medical documents (PDFs). Built with React, Node.js, Express, and SQLite.

## Features

- 📁 **File Upload**: Upload PDF medical documents with validation
- 📋 **Document Management**: View all uploaded documents with metadata
- ⬇️ **Download**: Download documents with original filenames
- 🗑️ **Delete**: Remove documents when no longer needed
- 🎨 **Modern UI**: Beautiful, responsive interface with animations
- 🔒 **Security**: File type validation and size limits
- 📱 **Mobile Friendly**: Responsive design for all devices

## Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Axios** for API communication

### Backend

- **Node.js** with Express.js
- **SQLite** for database
- **Multer** for file upload handling
- **CORS** for cross-origin requests
- **Helmet** for security headers

### Database

- **SQLite** for simple, file-based storage
- Documents table with metadata storage

## Project Structure

```
Healthcare-patient-portal/
├── design.md                 # Design document with architecture
├── backend/                  # Backend API server
│   ├── package.json
│   ├── server.js            # Main Express server
│   └── uploads/             # File storage directory
├── frontend/                # React frontend application
│   ├── package.json
│   ├── src/
│   │   ├── App.tsx         # Main application component
│   │   ├── services/
│   │   │   └── api.ts      # API service functions
│   │   ├── components/
│   │   │   └── ui/         # UI components
│   │   └── lib/
│   │       └── utils.ts    # Utility functions
│   └── public/
└── README.md               # This file
```

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Healthcare-patient-portal
   ```

2. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Start the backend server**

   ```bash
   cd ../backend
   npm run dev
   ```

   The backend will start on `http://localhost:3001`

5. **Start the frontend application**

   ```bash
   cd ../frontend
   npm run dev
   ```

   The frontend will start on `http://localhost:3000`

6. **Open your browser**
   Navigate to `http://localhost:3000` to use the application

## API Endpoints

### Upload Document

```bash
curl -X POST http://localhost:3001/api/documents/upload \
  -F "file=@document.pdf"
```

**Response:**

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": 1,
    "filename": "doc-1234567890.pdf",
    "originalName": "document.pdf",
    "fileSize": 1024000,
    "uploadDate": "2024-01-15T10:30:00.000Z"
  }
}
```

### List All Documents

```bash
curl -X GET http://localhost:3001/api/documents
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "filename": "doc-1234567890.pdf",
      "originalName": "prescription.pdf",
      "fileSize": 1024000,
      "uploadDate": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Download Document

```bash
curl -X GET http://localhost:3001/api/documents/1 \
  -o downloaded_file.pdf
```

### Delete Document

```bash
curl -X DELETE http://localhost:3001/api/documents/1
```

**Response:**

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### Health Check

```bash
curl -X GET http://localhost:3001/api/health
```

## Configuration

### File Upload Limits

- **Maximum file size**: 10MB
- **Allowed file types**: PDF only
- **Storage location**: `backend/uploads/` directory

### Database

- **Type**: SQLite
- **Location**: `backend/documents.db`
- **Auto-created**: Database and tables are created automatically

### Ports

- **Frontend**: 3000
- **Backend**: 3001

## Development

### Backend Development

```bash
cd backend
npm run dev  # Starts with nodemon for auto-reload
```

### Frontend Development

```bash
cd frontend
npm run dev  # Starts Vite dev server
```

### Building for Production

```bash
# Build frontend
cd frontend
npm run build

# Start backend in production
cd ../backend
npm start
```

## Security Features

- **File Type Validation**: Only PDF files are accepted
- **File Size Limits**: 10MB maximum per file
- **CORS Configuration**: Configured for local development
- **Security Headers**: Helmet.js for HTTP security headers
- **Input Validation**: Server-side validation for all inputs

## Error Handling

The application includes comprehensive error handling:

- **File Upload Errors**: Invalid file type, size limits
- **Network Errors**: Connection issues, timeouts
- **Database Errors**: Connection failures, query errors
- **User Feedback**: Clear success/error messages

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes and the healthcare assignment.

## Support

For issues or questions, please refer to the design document (`design.md`) for detailed architecture information.
