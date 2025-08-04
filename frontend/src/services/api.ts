import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Document {
  id: number;
  filename: string;
  originalName: string;
  fileSize: number;
  uploadDate: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export const documentApi = {
  // Upload a PDF file
  uploadFile: async (file: File): Promise<ApiResponse<Document>> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get all documents
  getDocuments: async (): Promise<ApiResponse<Document[]>> => {
    const response = await api.get("/documents");
    return response.data;
  },

  // Download a document
  downloadDocument: async (id: number, originalName: string): Promise<void> => {
    const response = await api.get(`/documents/${id}`, {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", originalName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // Delete a document
  deleteDocument: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  },
};
