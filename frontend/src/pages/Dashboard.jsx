import { useState, useEffect } from 'react'
import { studentsAPI, groupsAPI, submissionsAPI } from '../services/api.js'
import StudentCard from '../components/StudentCard'
import GroupCard from '../components/GroupCard'

const Dashboard = () => {
  const [stats, setStats] = useState({ students: 0, groups: 9, submissions: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, groupsRes, submissionsRes] = await Promise.all([
          studentsAPI.getAll(),
          groupsAPI.getAll(),
          submissionsAPI.getAll()
        ])
        setStats({
          students: studentsRes.length,
          groups: groupsRes.length,
          submissions: submissionsRes.length
        })
      } catch (error) {
        console.error('Dashboard error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.students}</div>
          <div className="text-gray-600">Total Students (54)</div>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.groups}</div>
          <div className="text-gray-600">Groups (9)</div>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="text-3xl font-bold text-purple-600 mb-2">{stats.submissions}</div>
          <div className="text-gray-600">Submissions</div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Students</h2>
          {/* Mock recent students - replace with real data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StudentCard student={{ name: 'John Doe', email: 'john@example.com', submissions: [] }} />
            <StudentCard student={{ name: 'Jane Smith', email: 'jane@example.com', submissions: [1] }} />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Groups Overview</h2>
          <div className="space-y-4">
            <GroupCard group={{ name: 'Group Alpha', submissions: [1,2] }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
