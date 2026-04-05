import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Users, BookOpen, FileText, LogOut, GraduationCap } from 'lucide-react'

const Sidebar = () => {
  const { role, logout } = useAuth()
  const navigate = useNavigate()

  const studentLinks = [
    { to: '/student/dashboard', label: 'My Group', icon: LayoutDashboard },
    { to: '/student/submissions', label: 'My Submissions', icon: FileText },
    { to: '/assignments', label: 'Assignments', icon: BookOpen },
  ]

  const lecturerLinks = [
    { to: '/lecturer/dashboard', label: 'All Groups', icon: Users },
    { to: '/lecturer/assignments', label: 'Assignments', icon: BookOpen },
  ]

  const links = role === 'lecturer' ? lecturerLinks : studentLinks

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Group System</h2>
            <p className="text-xs text-gray-500 capitalize">{role || 'student'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
