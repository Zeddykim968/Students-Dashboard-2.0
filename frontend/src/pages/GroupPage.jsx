import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { groupsAPI, submissionsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import GroupView from '../components/GroupView'
import { toast } from 'react-hot-toast'

const GroupPage = () => {
  const { id } = useParams()
  const { role } = useAuth()
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGroup()
  }, [id])

  const fetchGroup = async () => {
    try {
      const groupData = await groupsAPI.getById(id)
      setGroup(groupData)
    } catch (error) {
      toast.error('Failed to load group')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>
  }

  return (
    <GroupView group={group} role={role} />
  )
}

export default GroupPage

