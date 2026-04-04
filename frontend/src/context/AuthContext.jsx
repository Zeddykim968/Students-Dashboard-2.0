import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [role, setRole] = useState(localStorage.getItem('role') || null)

  useEffect(() => {
    // Check if user data in localStorage
    const savedUser = localStorage.getItem('user')
    const savedRole = localStorage.getItem('role')
    if (savedUser && savedRole) {
      setUser(JSON.parse(savedUser))
      setRole(savedRole)
    }
  }, [])

  const login = (response) => {
    const userInfo = response.user
    const userRole = userInfo.role || 'student'
    setUser(userInfo)
    setToken(response.access_token)
    setRole(userRole)
    localStorage.setItem('token', response.access_token)
    localStorage.setItem('user', JSON.stringify(userInfo))
    localStorage.setItem('role', userRole)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setRole(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
  }

  const value = { user, token, role, login, logout, isStudent: role === 'student', isLecturer: role === 'lecturer' }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

