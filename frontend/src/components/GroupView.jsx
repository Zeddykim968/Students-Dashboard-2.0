import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import MemberList from './MemberList'
import SubmissionList from './SubmissionList'
import UploadForm from './UploadForm'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Edit3 } from 'lucide-react'

const GroupView = ({ group, role }) => {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState([])

  const handleUploadSuccess = () => {
    // Refresh submissions
    fetchSubmissions()
  }

  const fetchSubmissions = async () => {
    try {
      const data = await submissionsAPI.getByGroup(group.id)
      setSubmissions(data)
    } catch (error) {
      toast.error('Failed to load submissions')
    }
  }

  return (
    <div className="space-y-8">
      {/* Group Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold">{group.name}</h1>
              <p className="text-blue-100 mt-2">{group.description || 'No description'}</p>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 px-4 py-2 rounded-full">
              <Edit3 className="h-5 w-5" />
              <span>{group.students?.length || 0} members</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Members */}
        <MemberList members={group.students || []} />

        {/* Submissions */}
        <SubmissionList submissions={submissions} onRefresh={fetchSubmissions} />
      </div>

      {/* Role-specific sections */}
      {role === 'student' && user && group.id && user.id && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Submit Assignment</h3>
          <UploadForm 
            groupId={group.id} 
            studentId={user.id} 
            onSuccess={handleUploadSuccess}
          />
        </div>
      )}

      {role === 'lecturer' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Lecturer Tools</h3>
          <p className="text-gray-600">Grade submissions, add feedback, and manage group here (coming soon).</p>
        </div>
      )}
    </div>
  )
}

export default GroupView

