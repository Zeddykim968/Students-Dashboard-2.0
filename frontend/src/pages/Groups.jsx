import { useState, useEffect } from 'react'
import { groupsAPI } from '../services/api.js'
import GroupCard from '../components/GroupCard'

const Groups = () => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await groupsAPI.getAll()
        setGroups(data)
      } catch (err) {
        setError('Failed to fetch groups')
      } finally {
        setLoading(false)
      }
    }
    fetchGroups()
  }, [])

  if (loading) return <div className="text-center py-12">Loading groups...</div>
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Groups (9 Groups)</h1>
        <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors font-medium">
          Add Group
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </div>
  )
}

export default Groups
