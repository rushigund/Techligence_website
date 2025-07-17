import axios from "axios";

// Get the base URL from environment variables, with a fallback for development
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create an Axios instance with default settings
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for sending cookies with requests
});

/**
 * Interceptor to add the auth token to every request if it exists.
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Products API Service
 * This is the `productsAPI` that was causing the error.
 */
export const productsAPI = {
  getAllProducts: () => apiClient.get("/products"),
  getProductById: (id: number) => apiClient.get(`/products/${id}`),
  addProduct: (productData: any) => apiClient.post("/products", productData),
  updateProduct: (id: number, productData: any) =>
    apiClient.put(`/products/${id}`, productData),
  deleteProduct: (id: number) => apiClient.delete(`/products/${id}`),
};

/**
 * Blog API Service
 */
export const blogAPI = {
  getAllBlogPosts: () => apiClient.get("/blog"),
  getBlogPostById: (id: number) => apiClient.get(`/blog/${id}`),
  addBlogPost: (postData: any) => apiClient.post("/blog", postData),
  updateBlogPost: (id: number, postData: any) =>
    apiClient.put(`/blog/${id}`, postData),
  deleteBlogPost: (id: number) => apiClient.delete(`/blog/${id}`),
};

/**
 * Auth API Service
 */
export const authAPI = {
  login: (credentials: any) => apiClient.post("/auth/login", credentials),
  register: (userData: any) => apiClient.post("/auth/register", userData),
  verifyToken: () => apiClient.get("/auth/verify-token"),
};

/**
 * Career API Service
 */
export const careerAPI = {
  submitApplication: (formData: FormData) =>
    apiClient.post("/career/apply", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Important for file uploads
      },
    }),
};

/**
 * Contact API Service
 */
export const contactAPI = {
  submitForm: (formData: any) => apiClient.post("/contact/submit", formData),
};

/**
 * URDF API Service
 * This is the missing `urdfAPI` that was causing the error.
 */
export const urdfAPI = {
  uploadFile: (file: File, additionalData: any) => {
    const formData = new FormData();
    formData.append("urdfFile", file);

    // Append any additional data (like robotType, category, etc.)
    Object.keys(additionalData).forEach((key) => {
      formData.append(key, additionalData[key]);
    });

    return apiClient.post("/urdf/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getUrdfFiles: () => apiClient.get("/urdf"),
  deleteUrdfFile: (id: string) => apiClient.delete(`/urdf/${id}`),
};