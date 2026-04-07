import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { groupsAPI, submissionsAPI, studentsAPI } from '../services/api'
import { Users, ChevronRight, LayoutGrid, Mail, Send, X, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

const LecturerDashboard = () => {
  const [groups, setGroups] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEmail, setShowEmail] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [sendAll, setSendAll] = useState(true)
  const [sending, setSending] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupData, studentData] = await Promise.all([
          groupsAPI.getAll(),
          studentsAPI.getAll(),
        ])
        setGroups(groupData)
        setStudents(studentData)
      } catch { toast.error('Failed to load data') }
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  const handleSendEmail = async (e) => {
    e.preventDefault()
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error('Subject and message are required')
      return
    }
    setSending(true)
    try {
      const payload = {
        subject: emailSubject,
        body: emailBody,
        student_ids: sendAll ? null : selectedIds,
      }
      const result = await studentsAPI.emailStudents(payload)
      if (result.sent_count > 0) {
        toast.success(`Email sent to ${result.sent_count} student(s)!`)
      } else {
        toast.success('Request processed. Configure SMTP to send real emails.')
      }
      setShowEmail(false)
      setEmailSubject('')
      setEmailBody('')
      setSelectedIds([])
      setSendAll(true)
    } catch (error) {
      toast.error(error.message || 'Failed to send email')
    } finally {
      setSending(false)
    }
  }

  const toggleStudent = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Groups</h1>
          <p className="text-gray-500 mt-1">Click any group to view submissions and grade students</p>
        </div>
        <button
          onClick={() => setShowEmail(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all shadow-sm"
        >
          <Mail className="h-5 w-5" />
          Email Students
        </button>
      </div>

      {/* Email Modal */}
      {showEmail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" /> Compose Email to Students
              </h2>
              <button onClick={() => setShowEmail(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="p-6 space-y-5">
              {/* Recipients */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Recipients</label>
                <div className="flex gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setSendAll(true)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      sendAll ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All {students.length} Students
                  </button>
                  <button
                    type="button"
                    onClick={() => setSendAll(false)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      !sendAll ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Select Specific
                  </button>
                </div>

                {!sendAll && (
                  <div className="border border-gray-200 rounded-xl max-h-48 overflow-y-auto">
                    {students.map(s => (
                      <label key={s.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(s.id)}
                          onChange={() => toggleStudent(s.id)}
                          className="rounded"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{s.name}</p>
                          <p className="text-xs text-gray-500">{s.email}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
                {!sendAll && selectedIds.length > 0 && (
                  <p className="text-sm text-blue-600 mt-1">{selectedIds.length} student(s) selected</p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Assignment 2 Submission Reminder"
                  required
                />
              </div>

              {/* Body */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Message</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Write your message here..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEmail(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending || (!sendAll && selectedIds.length === 0)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {sending ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Groups grid */}
      {groups.length === 0 ? (
        <div className="text-center py-20">
          <LayoutGrid className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500">No groups yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group) => {
            const grpStudents = (group.students || []).filter(s => s.role !== 'lecturer')
            const subs = group.submissions || []
            const submitted = grpStudents.filter(s => subs.some(sub => sub.student_id === s.id)).length
            const graded = subs.filter(s => s.grade).length

            return (
              <div
                key={group.id}
                onClick={() => navigate(`/group/${group.id}`)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 p-6 cursor-pointer transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-3">{group.name}</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded-xl py-2 px-1">
                    <p className="text-lg font-bold text-gray-900">{grpStudents.length}</p>
                    <p className="text-xs text-gray-500">Members</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl py-2 px-1">
                    <p className="text-lg font-bold text-blue-600">{submitted}</p>
                    <p className="text-xs text-gray-500">Submitted</p>
                  </div>
                  <div className="bg-green-50 rounded-xl py-2 px-1">
                    <p className="text-lg font-bold text-green-600">{graded}</p>
                    <p className="text-xs text-gray-500">Graded</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default LecturerDashboard
