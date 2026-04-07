const API_BASE = '/api'

const getToken = () => localStorage.getItem('token')

const clearAuth = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('role')
  window.location.href = '/login'
}

const apiCall = async (endpoint, options = {}) => {
  const token = getToken()
  const isFormData = options.body instanceof FormData
  const url = `${API_BASE}${endpoint}`

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const config = {
    method: options.method || 'GET',
    headers,
    ...(options.body !== undefined ? { body: options.body } : {}),
  }

  const response = await fetch(url, config)

  if (response.status === 401) {
    // Only auto-logout if the user already had a session token.
    // If there's no token, this is a failed login — just throw the error.
    if (token) {
      clearAuth()
      throw new Error('Session expired. Please log in again.')
    }
    const text = await response.text()
    let msg = 'Invalid email or password'
    try { msg = JSON.parse(text).detail || msg } catch {}
    throw new Error(msg)
  }

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
  login: async (data) => {
    // Never send an existing token for login — avoids false "session expired" errors
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const text = await response.text()
    let json
    try { json = JSON.parse(text) } catch {}
    if (!response.ok) {
      throw new Error((json && json.detail) || `Login failed (${response.status})`)
    }
    return json
  },
  changePassword: (data) => apiCall('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (data) => apiCall('/auth/forgot-password', { method: 'POST', body: JSON.stringify(data) }),
  resetPassword: (data) => apiCall('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),
}

export const studentsAPI = {
  getAll: () => apiCall('/students'),
  create: (data) => apiCall('/students', { method: 'POST', body: JSON.stringify(data) }),
  emailStudents: (data) => apiCall('/students/email', { method: 'POST', body: JSON.stringify(data) }),
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
