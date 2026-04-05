import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import StudentDashboard from './pages/StudentDashboard'
import LecturerDashboard from './pages/LecturerDashboard'
import GroupPage from './pages/GroupPage'
import Submissions from './pages/Submissions'
import Assignments from './pages/Assignments'
import ProtectedRoute from './components/ProtectedRoute'
import { Toaster } from 'react-hot-toast'
import './index.css'

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Routes>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/submissions" element={<Submissions />} />
            <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
            <Route path="/lecturer/assignments" element={<Assignments />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/group/:id" element={<GroupPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

const AppContent = () => {
  const { role } = useAuth()

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            role
              ? <Navigate to={role === 'lecturer' ? '/lecturer/dashboard' : '/student/dashboard'} replace />
              : <Navigate to="/login" replace />
          }
        />
        <Route path="/*" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
