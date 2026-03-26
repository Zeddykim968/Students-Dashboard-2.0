import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Groups from './pages/Groups'
import Submissions from './pages/Submissions'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex h-screen bg-gray-100">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/students" element={<Students />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/submissions" element={<Submissions />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
