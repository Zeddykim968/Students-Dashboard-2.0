import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import { toast } from 'react-hot-toast'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.forgotPassword({ email })
      setSent(true)
    } catch (error) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6">
        {sent ? (
          <div className="text-center space-y-4">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h1 className="text-2xl font-bold text-gray-900">Check your email</h1>
            <p className="text-gray-600">
              If <strong>{email}</strong> is registered, a password reset link has been sent.
              Check your inbox (and spam folder).
            </p>
            <Link to="/login"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center">
              <Mail className="mx-auto h-16 w-16 text-blue-500" />
              <h1 className="text-3xl font-bold text-gray-900 mt-4">Forgot Password?</h1>
              <p className="text-gray-600">Enter your email and we'll send a reset link.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="text-center">
              <Link to="/login"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
