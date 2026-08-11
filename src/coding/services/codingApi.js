import API from '../../services/api';

// Problems Endpoints
export const getProblems = async (params) => {
  const response = await API.get('/api/problems', { params });
  return response.data;
};

export const getProblemById = async (id) => {
  const response = await API.get(`/api/problems/${id}`);
  return response.data;
};

// Categories Endpoints
export const getCategories = async () => {
  const response = await API.get('/api/categories');
  return response.data;
};

// Submissions Endpoints
export const runCode = async (problemId, code, language, customInputs) => {
  const response = await API.post('/api/submissions/run', { problemId, code, language, customInputs });
  return response.data;
};

export const submitCode = async (problemId, code, language, contestId = null) => {
  const response = await API.post('/api/submissions/submit', { problemId, code, language, contestId });
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

// Issues Endpoints
export const submitIssue = async (problemId, problemTitle, description, screenshot) => {
  const response = await API.post('/api/issues', { problemId, problemTitle, description, screenshot });
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

// Contests Endpoints
export const getContests = async () => {
  const response = await API.get('/api/contests');
  return response.data;
};

export const getContestById = async (id) => {
  const response = await API.get(`/api/contests/${id}`);
  return response.data;
};

export const registerContest = async (id) => {
  const response = await API.post(`/api/contests/${id}/register`);
  return response.data;
};

export const getContestLeaderboard = async (id) => {
  const response = await API.get(`/api/contests/${id}/leaderboard`);
  return response.data;
};
