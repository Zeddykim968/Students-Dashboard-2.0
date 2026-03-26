// API service for backend http://localhost:8000/api (CORS enabled)
const API_BASE = 'http://localhost:8000/api'

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }
  const response = await fetch(url, config)
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json()
}

export const authAPI = {
  login: (data) => apiCall('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
}

export const studentsAPI = {
  getAll: () => apiCall('/students'),
  create: (data) => apiCall('/students', { method: 'POST', body: JSON.stringify(data) }),
}

export const groupsAPI = {
  getAll: () => apiCall('/groups'),
  create: (data) => apiCall('/groups', { method: 'POST', body: JSON.stringify(data) }),
  enroll: (groupId, studentId) => apiCall(`/groups/${groupId}/enroll/${studentId}`, { method: 'POST' }),
}

export const submissionsAPI = {
  getAll: () => apiCall('/submissions'),
  getByStudent: (id) => apiCall(`/submissions/student/${id}`),
  getByGroup: (id) => apiCall(`/submissions/group/${id}`),
  create: (data) => apiCall('/submissions', { method: 'POST', body: JSON.stringify(data) }),
}
