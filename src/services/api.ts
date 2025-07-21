// api.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased timeout to 60 seconds (60000 ms) for LLM responses
  headers: {
    "Content-Type": "application/json", // Default for most requests
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data"); // Assuming user_data is also stored
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  },
);

// Helper function to handle API calls (simplified without demo mode)
const apiCall = async (apiFunction: () => Promise<any>) => {
  try {
    return await apiFunction();
  } catch (error: any) {
    // Log network errors explicitly for debugging
    if (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED") {
      console.error("Network error: Backend is unreachable or connection refused.", error);
    }
    throw error; // Re-throw the actual error for the calling function to handle
  }
};

// Auth API (existing)
export const authAPI = {
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) =>
    apiCall(
      () => api.post("/auth/register", userData),
    ),

  login: (credentials: { email: string; password: string }) =>
    apiCall(
      () => api.post("/auth/login", credentials),
    ),

  logout: () =>
    apiCall(
      () => api.post("/auth/logout"),
    ),

  getProfile: () =>
    apiCall(
      () => api.get("/auth/profile"),
    ),

  updateProfile: (data: any) =>
    apiCall(
      () => api.put("/auth/profile", data),
    ),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiCall(
      () => api.put("/auth/change-password", data),
    ),

  refreshToken: () =>
    apiCall(
      () => api.post("/auth/refresh"),
    ),
};

// Products API (existing)
export const productsAPI = {
  addProduct: (productData: any) =>
    apiCall(() => api.post("/products", productData)),

  updateProduct: (productId: number, productData: any) =>
    apiCall(() => api.put(`/products/${productId}`, productData)),

  deleteProduct: (productId: number) =>
    apiCall(() => api.delete(`/products/${productId}`)),

  getProductById: (productId: number) =>
    apiCall(() => api.get(`/products/${productId}`)),

  getProducts: () =>
    apiCall(() => api.get("/products")),
};

// Blog API (existing)
export const blogAPI = {
  getBlogPosts: () =>
    apiCall(() => api.get("/blogposts")), // Fetches all blog posts
  getBlogPostById: (postId: number) =>
    apiCall(() => api.get(`/blogposts/${postId}`)), // Fetches a single blog post by ID
  addBlogPost: (postData: any) =>
    apiCall(() => api.post("/blogposts", postData)),
  updateBlogPost: (postId: number, postData: any) =>
    apiCall(() => api.put(`/blogposts/${postId}`, postData)),
  deleteBlogPost: (postId: number) =>
    apiCall(() => api.delete(`/blogposts/${postId}`)),
};

// Contact API (existing)
export const contactAPI = {
  submitContact: (formData: {
    name: string;
    email: string;
    company: string;
    subject: string;
    message: string;
    inquiryType: string;
  }) => apiCall(() => api.post("/contact", formData)),
};

// Career API for job applications (existing)
export const careerAPI = {
  submitApplication: (applicationData: FormData) =>
    apiCall(() =>
      api.post("/career/apply", applicationData, {
        headers: {
          "Content-Type": "multipart/form-data", // Crucial for file uploads
        },
      }),
    ),
  // API call to fetch all job listings
  getJobListings: () =>
    apiCall(() => api.get("/career/jobs")),

  // API call to create a new job listing (for admin)
  createJobListing: (jobData: {
    title: string;
    department: string;
    location: string;
    type: string;
    salary: string;
    description: string;
    skills: string[];
    isActive?: boolean;
  }) =>
    apiCall(() => api.post("/career/jobs", jobData)),

  // API call to delete a job listing (for admin)
  deleteJobListing: (jobId: string) =>
    apiCall(() => api.delete(`/career/jobs/${jobId}`)),

  // API call to get a single job listing by ID (for admin editing)
  getJobListingById: (jobId: string) =>
    apiCall(() => api.get(`/career/jobs/${jobId}`)),

  // API call to update a job listing (for admin)
  updateJobListing: (jobId: string, jobData: any) =>
    apiCall(() => api.put(`/career/jobs/${jobId}`, jobData)),
};

// NEW: Chatbot API
export const chatbotAPI = {
  sendMessage: (message: string) =>
    apiCall(() => api.post("/chatbot/message", { message })),
};

// NEW: OTP API
export const otpAPI = {
  send: (email: string) =>
    apiCall(() => api.post("/otp/send", { email })),
  verify: (email: string, otp: string) =>
    apiCall(() => api.post("/otp/verify", { email, otp })),
};

// NEW: Payment API (Razorpay)
export const paymentAPI = {
  createOrder: (amount: number) =>
    apiCall(() => api.post("/payment/create-order", { amount })),
  verifyPayment: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => apiCall(() => api.post("/payment/verify", data)),
};