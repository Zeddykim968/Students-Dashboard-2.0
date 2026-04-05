import { useState, useEffect } from 'react'
import { assignmentsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import { BookOpen, Plus, Trash2, Clock, Calendar, X } from 'lucide-react'

const Assignments = () => {
  const { role } = useAuth()
  const isLecturer = role === 'lecturer'
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', deadline: '' })
  const [saving, setSaving] = useState(false)

  const fetchAssignments = async () => {
    try {
      const data = await assignmentsAPI.getAll()
      setAssignments(data)
    } catch { toast.error('Failed to load assignments') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAssignments() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      await assignmentsAPI.create({
        title: form.title.trim(),
        description: form.description.trim() || null,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null
      })
      toast.success('Assignment created!')
      setForm({ title: '', description: '', deadline: '' })
      setShowForm(false)
      fetchAssignments()
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this assignment?')) return
    try {
      await assignmentsAPI.delete(id)
      toast.success('Deleted')
      fetchAssignments()
    } catch { toast.error('Delete failed') }
  }

  const isPastDeadline = (deadline) => deadline && new Date(deadline) < new Date()
  const daysLeft = (deadline) => {
    if (!deadline) return null
    const diff = new Date(deadline) - new Date()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
    </div>
  )

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-500 mt-1">{isLecturer ? 'Create and manage assignments for all groups' : 'Current assignments from your lecturer'}</p>
        </div>
        {isLecturer && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm shadow-purple-200"
          >
            {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showForm ? 'Cancel' : 'New Assignment'}
          </button>
        )}
      </div>

      {isLecturer && showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Create Assignment</h2>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Site Analysis Drawing"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Instructions, requirements, format..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Deadline</label>
            <input
              type="datetime-local"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Assignment'}
          </button>
        </form>
      )}

      {assignments.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
          <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="font-medium text-gray-500">No assignments yet</p>
          {isLecturer && <p className="text-sm text-gray-400 mt-1">Create one above to get started</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => {
            const days = daysLeft(a.deadline)
            const past = isPastDeadline(a.deadline)
            return (
              <div key={a.id} className={`bg-white rounded-2xl border shadow-sm p-6 transition-all ${past ? 'border-red-100' : 'border-gray-100'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${past ? 'bg-red-50' : 'bg-purple-50'}`}>
                      <BookOpen className={`h-5 w-5 ${past ? 'text-red-400' : 'text-purple-500'}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg">{a.title}</h3>
                      {a.description && <p className="text-gray-600 text-sm mt-1">{a.description}</p>}
                      {a.deadline && (
                        <div className={`flex items-center gap-1.5 mt-2 text-xs font-medium ${past ? 'text-red-500' : days <= 3 ? 'text-orange-500' : 'text-green-600'}`}>
                          <Clock className="h-3.5 w-3.5" />
                          {past
                            ? `Deadline passed (${new Date(a.deadline).toLocaleDateString()})`
                            : `${days} day${days !== 1 ? 's' : ''} left — due ${new Date(a.deadline).toLocaleDateString()}`
                          }
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Posted {new Date(a.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {isLecturer && (
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Assignments
