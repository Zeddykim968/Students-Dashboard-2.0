import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, role } = useAuth()

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold text-gray-800">
          Architecture Group Assignment System
        </h1>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-800">{user?.name || 'Guest'}</p>
            <p className="text-xs text-gray-400 capitalize">{role || ''}</p>
          </div>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0) || '?'}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
