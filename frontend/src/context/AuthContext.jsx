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

  const login = (userData, tokenData) => {
    setUser(userData)
    setToken(tokenData.access_token)
    localStorage.setItem('token', tokenData.access_token)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  const value = { user, token, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
