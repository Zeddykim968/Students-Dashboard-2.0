import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Users, BookOpen, FileText, LogOut, GraduationCap, ChevronLeft, ChevronRight, KeyRound } from 'lucide-react'

const Sidebar = ({ collapsed, onToggle }) => {
  const { role, logout } = useAuth()
  const navigate = useNavigate()

  const studentLinks = [
    { to: '/student/dashboard', label: 'My Group', icon: LayoutDashboard },
    { to: '/student/submissions', label: 'My Submissions', icon: FileText },
    { to: '/assignments', label: 'Assignments', icon: BookOpen },
    { to: '/change-password', label: 'Change Password', icon: KeyRound },
  ]

  const lecturerLinks = [
    { to: '/lecturer/dashboard', label: 'All Groups', icon: Users },
    { to: '/lecturer/assignments', label: 'Assignments', icon: BookOpen },
    { to: '/change-password', label: 'Change Password', icon: KeyRound },
  ]

  const links = role === 'lecturer' ? lecturerLinks : studentLinks

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside
      className={`relative bg-white shadow-lg border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className={`p-4 border-b border-gray-200 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-9 h-9 flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-gray-900 truncate">Group System</h2>
              <p className="text-xs text-gray-500 capitalize">{role || 'student'}</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
        )}
      </div>

      <button
        onClick={onToggle}
        className="absolute -right-3 top-7 z-10 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-blue-500 hover:border-blue-300 transition-all"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                title={collapsed ? label : undefined}
                className={({ isActive }) =>
                  `flex items-center px-2.5 py-2.5 rounded-xl transition-all text-sm font-medium ${
                    collapsed ? 'justify-center' : 'space-x-3'
                  } ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-3 border-t border-gray-200">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign Out' : undefined}
          className={`flex items-center w-full px-2.5 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all ${
            collapsed ? 'justify-center' : 'space-x-3'
          }`}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
