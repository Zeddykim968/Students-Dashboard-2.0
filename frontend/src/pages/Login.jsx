import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await authAPI.login({ email: email.trim().toLowerCase(), password: password.trim() })
      login(response)
      toast.success('Login successful!')

      const role = response.user.role || 'student'
      if (response.user.must_change_password) {
        navigate('/change-password')
      } else if (role === 'lecturer') {
        navigate('/lecturer/dashboard')
      } else {
        navigate('/student/dashboard')
      }
    } catch (error) {
      toast.error(error.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <LogIn className="mx-auto h-16 w-16 text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Welcome Back</h1>
          <p className="text-gray-600">Architecture Design Studio — KU</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
          <strong>First time?</strong> Use the uniform password: <code className="bg-blue-100 px-1 rounded font-mono">Arch@2025</code>
          <br />You'll be prompted to set your own password after logging in.
        </div>

        <button
          type="button"
          onClick={() => { setEmail('lecturer@ku.ac.ke'); setPassword('Lecturer2025') }}
          className="w-full border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 py-2 px-4 rounded-xl text-sm font-medium transition-all"
        >
          Fill Lecturer Credentials
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Lock className="h-4 w-4 mr-2" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
              Forgot your password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 transition-all shadow-lg"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
