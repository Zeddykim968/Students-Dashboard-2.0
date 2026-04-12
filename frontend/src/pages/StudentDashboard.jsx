import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { groupsAPI, assignmentsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Users, BookOpen, Calendar, ChevronRight, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'

const StudentDashboard = () => {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        let groupId = user?.group_id
        if (!groupId && user?.id) {
          try {
            const myGrp = await groupsAPI.getMyGroup()
            if (myGrp?.id) {
              groupId = myGrp.id
              updateUser({ group_id: myGrp.id })
            }
          } catch {}
        }
        const [grp, asns] = await Promise.all([
          groupId ? groupsAPI.getById(groupId) : Promise.resolve(null),
          assignmentsAPI.getAll()
        ])
        setGroup(grp)
        setAssignments(asns)
      } catch { toast.error('Failed to load data') }
      finally { setLoading(false) }
    }
    fetchData()
  }, [user?.id])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>
  )

  const isPastDeadline = (deadline) => deadline && new Date(deadline) < new Date()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name?.split(' ')[0]}</h1>
        <p className="text-gray-500 mt-1">{user?.reg_no}</p>
      </div>

      {group ? (
        <div
          onClick={() => navigate(`/group/${group.id}`)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-7 text-white cursor-pointer hover:shadow-xl hover:shadow-blue-200 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-6 w-6" />
                <span className="text-sm font-medium opacity-80">Your Group</span>
              </div>
              <h2 className="text-3xl font-bold">{group.name}</h2>
              <p className="text-blue-100 mt-2">{group.students?.filter(s => s.role !== 'lecturer').length || 0} members</p>
            </div>
            <ChevronRight className="h-8 w-8 opacity-70 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-500 border-2 border-dashed border-gray-200">
          <Users className="mx-auto h-10 w-10 mb-3 text-gray-300" />
          <p className="font-medium">You are not assigned to a group yet</p>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-purple-500" />
          <h2 className="text-xl font-bold text-gray-900">Assignments</h2>
        </div>
        {assignments.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-6 text-center text-gray-400 border border-dashed border-gray-200">
            <BookOpen className="mx-auto h-8 w-8 mb-2 text-gray-300" />
            <p className="text-sm">No assignments yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((a) => (
              <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{a.title}</h3>
                    {a.description && <p className="text-sm text-gray-500 mt-1">{a.description}</p>}
                  </div>
                  {a.deadline && (
                    <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${
                      isPastDeadline(a.deadline)
                        ? 'bg-red-100 text-red-600'
                        : 'bg-green-100 text-green-600'
                    }`}>
                      <Clock className="h-3 w-3" />
                      {isPastDeadline(a.deadline) ? 'Overdue · ' : 'Due · '}
                      {new Date(a.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentDashboard
