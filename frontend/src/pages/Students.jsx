import { useState, useEffect } from 'react'
import { studentsAPI } from '../services/api.js'
import StudentCard from '../components/StudentCard'

const Students = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await studentsAPI.getAll()
        setStudents(data)
      } catch (err) {
        setError('Failed to fetch students')
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [])

  if (loading) return <div className="text-center py-12">Loading students...</div>
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Students</h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors font-medium">
          Add Student
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {students.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))}
      </div>
    </div>
  )
}

export default Students
