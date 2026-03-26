const StudentCard = ({ student }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-lg">
            {student.name?.charAt(0)?.toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{student.name}</h3>
          <p className="text-sm text-gray-500">{student.email}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Submissions:</span>
          <span className="font-medium text-gray-900 ml-1">{student.submissions?.length || 0}</span>
        </div>
      </div>
    </div>
  )
}

export default StudentCard
