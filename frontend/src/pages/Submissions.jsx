import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { submissionsAPI, studentsAPI, groupsAPI } from '../services/api.js'
import SubmissionModal from '../components/SubmissionModal'

const Submissions = () => {
  const { user } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [students, setStudents] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subsRes, studentsRes, groupsRes] = await Promise.all([
          submissionsAPI.getAll(),
          studentsAPI.getAll(),
          groupsAPI.getAll()
        ])
        setSubmissions(subsRes)
        setStudents(studentsRes)
        setGroups(groupsRes)
      } catch (error) {
        console.error('Submissions fetch error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleNewSubmission = (studentId, groupId) => {
    setSelectedStudent({ id: studentId })
    setShowModal(true)
  }

  if (loading) return <div className="text-center py-12">Loading submissions...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Submissions</h1>
      <SubmissionModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        studentId={selectedStudent?.id}
        groupId={1} // Example group ID
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Submissions</h2>
          <div className="space-y-4">
            {submissions.slice(0, 5).map((submission) => (
              <div key={submission.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{submission.file_url}</p>
                  <p className="text-sm text-gray-500">
                    Student ID: {submission.student_id} | Group ID: {submission.group_id}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(submission.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="space-y-4">
            <button
              onClick={() => handleNewSubmission(1, 1)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors font-medium"
            >
              New Submission
            </button>
            <button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-4 rounded-lg transition-colors font-medium">
              View All Assignments
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Submissions
