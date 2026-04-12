import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { toast } from 'react-hot-toast'
import { KeyRound, Lock, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link')
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPassword !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await authAPI.resetPassword({ token, new_password: newPassword })
      toast.success('Password reset! You can now log in.')
      navigate('/login')
    } catch (error) {
      toast.error(error.message || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-6">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center space-y-4">
          <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900">Invalid Link</h1>
          <p className="text-gray-600">This reset link is missing or invalid. Please request a new one.</p>
          <Link to="/forgot-password"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
            <ArrowLeft className="h-4 w-4 mr-1" /> Request New Link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6">
        <div className="text-center">
          <KeyRound className="mx-auto h-16 w-16 text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Reset Password</h1>
          <p className="text-gray-600">Enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Lock className="h-4 w-4 mr-2" />
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Lock className="h-4 w-4 mr-2" />
              Confirm Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 ${
                confirm && confirm !== newPassword ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="Repeat new password"
              required
            />
            {confirm && confirm !== newPassword && (
              <p className="text-red-500 text-sm mt-1">Passwords don't match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg"
          >
            {loading ? 'Saving...' : 'Reset Password'}
          </button>
        </form>

        <div className="text-center">
          <Link to="/login"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
