import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="text-xl font-bold text-gray-800">
          Students Dashboard
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {user ? `Hi, ${user.name || user.email}` : 'Guest'}
          </span>
          {user ? (
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          ) : (
            <span className="text-gray-500">Login</span>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
