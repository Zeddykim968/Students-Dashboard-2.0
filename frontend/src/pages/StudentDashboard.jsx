import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { groupsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import GroupCard from '../components/GroupCard'
import { Users, LayoutGrid } from 'lucide-react'
import { toast } from 'react-hot-toast'

const StudentDashboard = () => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const data = await groupsAPI.getAll()
      setGroups(data)
    } catch (error) {
      toast.error('Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>
  }

  return (
    <div>
      <div className="flex items-center space-x-4 mb-8">
        <Users className="h-8 w-8 text-blue-500" />
        <h1 className="text-3xl font-bold text-gray-900">My Groups</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} onClick={() => navigate(`/group/${group.id}`)} />
        ))}
      </div>
      {groups.length === 0 && (
        <div className="text-center py-20">
          <LayoutGrid className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h3>
          <p className="text-gray-500">Join or create groups to get started.</p>
        </div>
      )}
    </div>
  )
}

export default StudentDashboard

