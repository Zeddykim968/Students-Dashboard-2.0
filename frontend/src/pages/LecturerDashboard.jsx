import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { groupsAPI, submissionsAPI } from '../services/api'
import { Users, ChevronRight, LayoutGrid, CheckCircle, Star } from 'lucide-react'
import { toast } from 'react-hot-toast'

const GRADE_COLORS = {
  A: 'bg-green-100 text-green-700', B: 'bg-blue-100 text-blue-700',
  C: 'bg-yellow-100 text-yellow-700', D: 'bg-orange-100 text-orange-700',
  E: 'bg-red-100 text-red-700', F: 'bg-red-100 text-red-700',
}

const LecturerDashboard = () => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await groupsAPI.getAll()
        setGroups(data)
      } catch { toast.error('Failed to load groups') }
      finally { setLoading(false) }
    }
    fetchGroups()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">All Groups</h1>
        <p className="text-gray-500 mt-1">Click any group to view submissions and grade students</p>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-20">
          <LayoutGrid className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <p className="text-gray-500">No groups yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group) => {
            const students = (group.students || []).filter(s => s.role !== 'lecturer')
            const subs = group.submissions || []
            const submitted = students.filter(s => subs.some(sub => sub.student_id === s.id)).length
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
                    <p className="text-lg font-bold text-gray-900">{students.length}</p>
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
