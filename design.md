# Healthcare Patient Portal - Design Document

## 1. Tech Stack Choices

### Q1. What frontend framework did you use and why?

**Answer**: React with TypeScript and Shadcn UI

**Justification**:

- **React**: Most popular and mature frontend framework with excellent ecosystem
- **TypeScript**: Provides type safety and better developer experience
- **Shadcn UI**: Modern, accessible, and customizable component library that provides beautiful pre-built components
- **Vite**: Fast build tool for optimal development experience
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development

### Q2. What backend framework did you choose and why?

**Answer**: Node.js with Express.js

**Justification**:

- **Express.js**: Lightweight, flexible, and widely adopted Node.js framework
- **JavaScript**: Consistent language across frontend and backend
- **Multer**: Excellent middleware for handling file uploads
- **CORS**: Built-in support for cross-origin requests
- **Helmet**: Security middleware for HTTP headers

### Q3. What database did you choose and why?

**Answer**: SQLite

**Justification**:

- **Simplicity**: No separate database server required, perfect for local development
- **Zero Configuration**: File-based database that works out of the box
- **Reliability**: ACID compliant and battle-tested
- **Performance**: Excellent for small to medium applications
- **Portability**: Single file database that's easy to backup and deploy

### Q4. If you were to support 1,000 users, what changes would you consider?

**Answer**: For 1,000 users, I would consider the following changes:

**Infrastructure**:

- **Database**: Migrate to PostgreSQL for better concurrent access and advanced features
- **File Storage**: Use cloud storage (AWS S3, Google Cloud Storage) instead of local storage
- **CDN**: Implement CDN for faster file delivery
- **Load Balancer**: Add load balancing for horizontal scaling

**Security**:

- **Authentication**: Implement JWT-based user authentication
- **Authorization**: Role-based access control (RBAC)
- **File Encryption**: Encrypt sensitive medical documents
- **Rate Limiting**: Prevent abuse with rate limiting
- **Input Validation**: Enhanced validation and sanitization

**Performance**:

- **Caching**: Redis for session and metadata caching
- **Database Indexing**: Optimize queries with proper indexing
- **File Compression**: Compress large PDFs
- **Pagination**: Implement pagination for large file lists

**Monitoring**:

- **Logging**: Structured logging with Winston or similar
- **Metrics**: Application performance monitoring
- **Health Checks**: API health endpoints
- **Error Tracking**: Sentry or similar for error monitoring

## 2. Architecture Overview

```
┌─────────────────┐    HTTP Requests    ┌─────────────────┐
│   Frontend      │ ◄─────────────────► │    Backend      │
│   (React)       │                     │   (Express.js)  │
└─────────────────┘                     └─────────────────┘
                                                │
                                                ▼
┌─────────────────┐                     ┌─────────────────┐
│   Database      │ ◄─────────────────► │   File Storage  │
│   (SQLite)      │                     │   (uploads/)    │
└─────────────────┘                     └─────────────────┘
```

**Data Flow**:

1. **Frontend** sends HTTP requests to **Backend**
2. **Backend** processes requests and interacts with **Database** and **File Storage**
3. **Database** stores file metadata (filename, size, upload date, etc.)
4. **File Storage** stores actual PDF files in local filesystem
5. **Backend** returns responses to **Frontend**

## 3. API Specification

### Endpoint 1: Upload PDF File

- **URL**: `POST /api/documents/upload`
- **Method**: POST
- **Content-Type**: `multipart/form-data`

**Request**:

```bash
curl -X POST http://localhost:3001/api/documents/upload \
  -F "file=@document.pdf"
```

**Response**:

```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": 1,
    "filename": "document.pdf",
    "originalName": "document.pdf",
    "fileSize": 1024000,
    "uploadDate": "2024-01-15T10:30:00.000Z"
  }
}
```

### Endpoint 2: List All Documents

- **URL**: `GET /api/documents`
- **Method**: GET

**Request**:

```bash
curl -X GET http://localhost:3001/api/documents
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "filename": "document1.pdf",
      "originalName": "prescription.pdf",
      "fileSize": 1024000,
      "uploadDate": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": 2,
      "filename": "document2.pdf",
      "originalName": "test_results.pdf",
      "fileSize": 2048000,
      "uploadDate": "2024-01-15T11:00:00.000Z"
    }
  ]
}
```

### Endpoint 3: Download Document

- **URL**: `GET /api/documents/:id`
- **Method**: GET

**Request**:

```bash
curl -X GET http://localhost:3001/api/documents/1 \
  -o downloaded_file.pdf
```

**Response**: File stream (PDF content)

### Endpoint 4: Delete Document

- **URL**: `DELETE /api/documents/:id`
- **Method**: DELETE

**Request**:

```bash
curl -X DELETE http://localhost:3001/api/documents/1
```

**Response**:

```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

## 4. Data Flow Description

### File Upload Process:

1. **Frontend**: User selects PDF file and clicks upload
2. **Frontend**: Validates file type (PDF only) and size
3. **Frontend**: Sends file to backend via FormData
4. **Backend**: Receives file using Multer middleware
5. **Backend**: Validates file type and size on server
6. **Backend**: Generates unique filename to prevent conflicts
7. **Backend**: Saves file to `uploads/` directory
8. **Backend**: Stores metadata in SQLite database
9. **Backend**: Returns success response with file details
10. **Frontend**: Updates UI to show new file in list

### File Download Process:

1. **Frontend**: User clicks download button for specific file
2. **Frontend**: Sends GET request with file ID
3. **Backend**: Receives request and validates file ID
4. **Backend**: Queries database for file metadata
5. **Backend**: Checks if file exists in filesystem
6. **Backend**: Streams file content to response
7. **Frontend**: Receives file stream and triggers download
8. **Browser**: Downloads file with original filename

## 5. Assumptions

### Q6. What assumptions did you make while building this?

**File Handling**:

- **File Size Limit**: 10MB maximum per file (configurable)
- **File Type**: Only PDF files allowed
- **File Naming**: Generate unique filenames to prevent conflicts
- **Storage**: Local filesystem storage (uploads/ directory)

**Security**:

- **No Authentication**: Single user system as specified
- **Input Validation**: Server-side validation for all inputs
- **File Sanitization**: Validate file headers, not just extensions
- **CORS**: Configured for local development

**Database**:

- **Schema**: Simple documents table with essential fields
- **Indexing**: Primary key on ID, index on upload date
- **Constraints**: NOT NULL constraints on required fields

**Performance**:

- **File Streaming**: Stream large files instead of loading into memory
- **Error Handling**: Comprehensive error handling and logging
- **Response Format**: Consistent JSON response structure

**Development**:

- **Environment**: Local development setup
- **Ports**: Frontend on 3000, Backend on 3001
- **Hot Reload**: Development server with hot reload
- **Error Boundaries**: React error boundaries for graceful failures

**User Experience**:

- **Loading States**: Show loading indicators during operations
- **Success/Error Messages**: Clear feedback for all operations
- **Responsive Design**: Mobile-friendly interface
- **File Preview**: Show file size and upload date in list
