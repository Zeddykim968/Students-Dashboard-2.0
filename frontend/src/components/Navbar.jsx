import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { KeyRound, LogOut, ChevronDown } from 'lucide-react'

const Navbar = () => {
  const { user, role, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold text-gray-800">
          Architecture Group Assignment System
        </h1>
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 hover:bg-gray-50 rounded-xl px-3 py-2 transition-colors"
          >
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{user?.name || 'Guest'}</p>
              <p className="text-xs text-gray-400 capitalize">{role || ''}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0) || '?'}
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { setOpen(false); navigate('/change-password') }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <KeyRound className="h-4 w-4 text-blue-500" />
                Change Password
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
