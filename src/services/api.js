import axios from 'axios';

// Create Axios Instance
// In development, Vite config proxy will forward '/api' requests to http://localhost:5000.
// For robust fallback, we use an empty baseURL or relative URL so the proxy can catch it,
// but we can also check if we want an explicit baseURL.
const API = axios.create({
  baseURL: 'http://localhost:5003',
});

// Request Interceptor to inject JWT Token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const login = async (email, password) => {
  const response = await API.post('/api/auth/login', { email, password });
  return response.data;
};



export const getProfile = async () => {
  const response = await API.get('/api/auth/profile');
  return response.data;
};

// Problems Endpoints
export const getProblems = async () => {
  const response = await API.get('/api/problems');
  return response.data;
};

export const getProblemById = async (id) => {
  const response = await API.get(`/api/problems/${id}`);
  return response.data;
};

export const createProblem = async (problemData) => {
  const response = await API.post('/api/problems', problemData);
  return response.data;
};

export const updateProblem = async (id, problemData) => {
  const response = await API.put(`/api/problems/${id}`, problemData);
  return response.data;
};

export const deleteProblem = async (id) => {
  const response = await API.delete(`/api/problems/${id}`);
  return response.data;
};

// Categories Endpoints
export const getCategories = async () => {
  const response = await API.get('/api/categories');
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await API.post('/api/categories', categoryData);
  return response.data;
};

// Submissions Endpoints
export const runCode = async (problemId, code, language, customInput) => {
  const response = await API.post('/api/submissions/run', { problemId, code, language, customInput });
  return response.data;
};

export const submitCode = async (problemId, code, language) => {
  const response = await API.post('/api/submissions/submit', { problemId, code, language });
  return response.data;
};

export const getSubmissionStatus = async (id) => {
  const response = await API.get(`/api/submissions/${id}`);
  return response.data;
};

export const getSubmissions = async (problemId = null) => {
  const url = problemId ? `/api/submissions?problemId=${problemId}` : '/api/submissions';
  const response = await API.get(url);
  return response.data;
};

// Admin Dashboard stats
export const getDashboardStats = async () => {
  const response = await API.get('/api/dashboard/stats');
  return response.data;
};

// Issues Endpoints
export const getIssues = async () => {
  const response = await API.get('/api/issues');
  return response.data;
};

export const updateIssueStatus = async (id, resolved) => {
  const response = await API.put(`/api/issues/${id}`, { resolved });
  return response.data;
};

export const deleteIssue = async (id) => {
  const response = await API.delete(`/api/issues/${id}`);
  return response.data;
};

// Contests Endpoints
export const getContests = async () => {
  const response = await API.get('/api/contests');
  return response.data;
};

export const getContestById = async (id) => {
  const response = await API.get(`/api/contests/${id}`);
  return response.data;
};

export const updateContest = async (id, contestData) => {
  const response = await API.put(`/api/contests/${id}`, contestData);
  return response.data;
};

export const createContest = async (contestData) => {
  const response = await API.post('/api/contests', contestData);
  return response.data;
};

export const createContestProblem = async (contestId, problemData) => {
  const response = await API.post(`/api/contests/${contestId}/problems`, problemData);
  return response.data;
};

export const getContestLeaderboard = async (contestId) => {
  const response = await API.get(`/api/contests/${contestId}/leaderboard`);
  return response.data;
};

export const releaseContestProblems = async (contestId) => {
  const response = await API.post(`/api/contests/${contestId}/release-problems`);
  return response.data;
};

// Discussions Endpoints
export const getDiscussions = async (problemId) => {
  const response = await API.get(`/api/discussions?problemId=${problemId}`);
  return response.data;
};

export const createDiscussion = async (problemId, content) => {
  const response = await API.post('/api/discussions', { problemId, content });
  return response.data;
};

export const updateDiscussion = async (id, content) => {
  const response = await API.put(`/api/discussions/${id}`, { content });
  return response.data;
};

export const deleteDiscussion = async (id) => {
  const response = await API.delete(`/api/discussions/${id}`);
  return response.data;
};

// Approvals
export const getPendingRequests = async () => {
  const response = await API.get('/api/approvals/pending');
  return response.data;
};

export const getRequestHistory = async () => {
  const response = await API.get('/api/approvals/history');
  return response.data;
};

export const getAutoApprovedLogs = async () => {
  const response = await API.get('/api/approvals/auto-logs');
  return response.data;
};

export const approveRequest = async (id, adminNote) => {
  const response = await API.put(`/api/approvals/${id}/approve`, { adminNote });
  return response.data;
};

export const rejectRequest = async (id, adminNote) => {
  const response = await API.put(`/api/approvals/${id}/reject`, { adminNote });
  return response.data;
};

// Setters Management
export const getSetters = async () => {
  const response = await API.get('/api/management/setters');
  return response.data;
};

export const updateSetterStatus = async (id, updateData) => {
  const response = await API.put(`/api/management/setters/${id}`, updateData);
  return response.data;
};

export default API;
