const API_BASE = '/api'

const getToken = () => localStorage.getItem('token')

const apiCall = async (endpoint, options = {}) => {
  const token = getToken()
  const isFormData = options.body instanceof FormData
  const url = `${API_BASE}${endpoint}`
  const config = {
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  }
  const response = await fetch(url, config)
  if (!response.ok) {
    const text = await response.text()
    let msg = `API error: ${response.status}`
    try { msg = JSON.parse(text).detail || msg } catch {}
    throw new Error(msg)
  }
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) return response.json()
  return response.blob()
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
  getById: (id) => apiCall(`/groups/${id}`),
  getMembers: (id) => apiCall(`/groups/${id}/students`),
  getMyGroup: () => apiCall('/my-group'),
  create: (data) => apiCall('/groups', { method: 'POST', body: JSON.stringify(data) }),
  enroll: (groupId, studentId) => apiCall(`/groups/${groupId}/enroll/${studentId}`, { method: 'POST' }),
}

export const submissionsAPI = {
  getAll: () => apiCall('/submissions'),
  getByStudent: (id) => apiCall(`/submissions/student/${id}`),
  getByGroup: (id) => apiCall(`/submissions/group/${id}`),
  create: (formData) => apiCall('/submissions', { method: 'POST', body: formData }),
  grade: (id, data) => apiCall(`/submissions/${id}/grade`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/submissions/${id}`, { method: 'DELETE' }),
  downloadUrl: (id) => `${API_BASE}/submissions/${id}/download`,
}

export const messagesAPI = {
  getByGroup: (groupId) => apiCall(`/groups/${groupId}/messages`),
  send: (groupId, data) => apiCall(`/groups/${groupId}/messages`, { method: 'POST', body: JSON.stringify(data) }),
}

export const assignmentsAPI = {
  getAll: () => apiCall('/assignments'),
  create: (data) => apiCall('/assignments', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/assignments/${id}`, { method: 'DELETE' }),
}
