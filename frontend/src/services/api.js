import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://ai-resume-analyzer-backend-7j2s.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ============ RESUME ENDPOINTS ============

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload-resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getResumes = async () => {
  const response = await api.get('/resumes');
  return response.data;
};

export const getResume = async (resumeId) => {
  const response = await api.get(`/resume/${resumeId}`);
  return response.data;
};

export const analyzeResume = async (resumeId, jobDescription = null) => {
  const response = await api.post('/analyze-resume', {
    resume_id: resumeId,
    job_description: jobDescription,
  });
  return response.data;
};

export const generateReport = async (resumeId) => {
  const response = await api.get(`/generate-report/${resumeId}`, {
    responseType: 'blob',
  });
  return response.data;
};

// ============ JOB MATCHING ============

export const matchJob = async (data) => {
  const response = await api.post('/match-job', data);
  return response.data;
};

export const getMatchHistory = async (resumeId) => {
  const response = await api.get(`/match-history/${resumeId}`);
  return response.data;
};

// ============ AI FEATURES ============

export const generateHeatmap = async (resumeId) => {
  const response = await api.post(`/generate-heatmap/${resumeId}`);
  return response.data;
};

export const rewriteSection = async (data) => {
  const response = await api.post('/rewrite-resume-section', {
    resume_id: data.resume_id,
    section_text: data.section_text,
    section_type: data.section_type,
    style: data.style || 'professional',
  });
  return response.data;
};

export const generateCoverLetter = async (data) => {
  const response = await api.post('/generate-cover-letter', {
    resume_id: data.resume_id,
    job_title: data.job_title,
    company: data.company,
    job_description: data.job_description,
  });
  return response.data;
};

export const analyzeSkillGap = async (data) => {
  const response = await api.post('/analyze-skill-gap', {
    resume_id: data.resume_id,
    job_skills: data.job_skills,
  });
  return response.data;
};

export const generateLearningRoadmap = async (data) => {
  const response = await api.post('/generate-learning-roadmap', {
    resume_id: data.resume_id,
    target_role: data.target_role,
  });
  return response.data;
};

export const generateInterviewQuestions = async (data) => {
  const response = await api.post('/generate-interview-questions', {
    resume_id: data.resume_id,
    job_title: data.job_title,
    job_description: data.job_description,
  });
  return response.data;
};

export const analyzeGithub = async (data) => {
  const response = await api.post('/analyze-github', {
    username: data.username,
    user_id: data.user_id,
  });
  return response.data;
};

export const chatWithResume = async (data) => {
  const response = await api.post('/chat-with-resume', {
    resume_id: data.resume_id,
    message: data.message,
  });
  return response.data;
};

// ============ VERSION CONTROL ============

export const saveResumeVersion = async (data) => {
  const response = await api.post('/save-resume-version', {
    resume_id: data.resume_id,
    content: data.content,
    changes: data.changes,
  });
  return response.data;
};

export const getResumeVersions = async (resumeId) => {
  // This endpoint might not exist in backend - create a fallback
  try {
    const response = await api.get(`/resume-versions/${resumeId}`);
    return response.data;
  } catch (error) {
    // Return empty array if endpoint doesn't exist
    console.warn('Versions endpoint not available, returning empty array');
    return { versions: [] };
  }
};

// ============ ANALYTICS ============

export const trackAnalytics = async (data) => {
  const response = await api.post('/track-analytics', {
    user_id: data.user_id,
    event_type: data.event_type,
    event_data: data.event_data,
  });
  return response.data;
};

export const getAnalyticsDashboard = async (userId) => {
  const response = await api.get(`/analytics/dashboard/${userId}`);
  return response.data;
};

// ============ NEW FEATURE: BULK ANALYSIS ============

export const bulkAnalyzeResumes = async (resumeIds, jobDescription = null) => {
  const response = await api.post('/bulk-analyze', {
    resume_ids: resumeIds,
    job_description: jobDescription,
  });
  return response.data;
};

// ============ NEW FEATURE: RESUME COMPARE ============

export const compareResumes = async (resumeId1, resumeId2) => {
  const response = await api.post('/compare-resumes', {
    resume_id_1: resumeId1,
    resume_id_2: resumeId2,
  });
  return response.data;
};

// ============ NEW FEATURE: EXPORT DATA ============

export const exportResumeData = async (resumeId, format = 'json') => {
  const response = await api.get(`/export-resume/${resumeId}?format=${format}`, {
    responseType: format === 'pdf' ? 'blob' : 'json',
  });
  return response.data;
};

export default api;

// Add these to your api.js

// ============ JOB SEARCH ============

export const findJobs = async (data) => {
  const response = await api.post('/find-jobs', {
    resume_id: data.resume_id,
    job_title: data.job_title || '',
    location: data.location || '',
    source: data.source || 'all',
    limit: data.limit || 10
  });
  return response.data;
};

export const getJobSearchHistory = async (resumeId) => {
  const response = await api.get(`/job-search-history/${resumeId}`);
  return response.data;
};

// ============ SAVE JOBS ============

export const saveJob = async (data) => {
  const response = await api.post('/save-job', {
    resume_id: data.resume_id,
    job_title: data.job_title,
    company: data.company,
    job_url: data.job_url,
    match_score: data.match_score
  });
  return response.data;
};

export const getSavedJobs = async (resumeId) => {
  const response = await api.get(`/saved-jobs/${resumeId}`);
  return response.data;
};