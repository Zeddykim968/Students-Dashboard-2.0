const API_BASE = '/api'

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`
  const config = {
    headers: {
      "Content-Type": options.body instanceof FormData ? undefined : 'application/json',
      ...options.headers,
    },
    ...options,
  }
  const response = await fetch(url, config)
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json()
  }
  return response.blob() // for file responses if needed
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
  create: (data) => apiCall('/groups', { method: 'POST', body: JSON.stringify(data) }),
  enroll: (groupId, studentId) => apiCall(`/groups/${groupId}/enroll/${studentId}`, { method: 'POST' }),
}

export const submissionsAPI = {
  getAll: () => apiCall('/submissions'),
  getByStudent: (id) => apiCall(`/submissions/student/${id}`),
  getByGroup: (id) => apiCall(`/submissions/group/${id}`),
  create: (formData) => apiCall('/submissions', { 
    method: 'POST', 
    body: formData 
  }),
  uploadSubmission: (formData) => apiCall('/submissions', { 
    method: 'POST', 
    body: formData 
  }),
}

