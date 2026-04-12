const GroupCard = ({ group, onClick }) => {
  const maxMembers = 4
  const membersPreview = group.students?.slice(0, maxMembers) || []

  return (
    <div 
      className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer group/card-hover"
      onClick={onClick}
    >
      <h3 className="font-semibold text-xl text-gray-900 mb-4">{group.name}</h3>
      
      <div className="flex justify-between items-center mb-4">
        <div className="flex -space-x-2">
          {membersPreview.map((student, index) => (
            <div
              key={student.id || index}
              className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-md"
              title={student.name}
            >
              {student.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          ))}
          {group.students && group.students.length > maxMembers && (
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-500 border-2 border-white shadow-md">
              +{group.students.length - maxMembers}
            </div>
          )}
        </div>
        <span className="font-medium text-gray-900">{group.students?.length || 0}</span>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Submissions:</span>
          <span className="font-medium text-gray-900">{group.submissions?.length || 0}</span>
        </div>
      </div>

      <div className="group-hover:scale-105 transition-transform">
        <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
      </div>
    </div>
  )
}

export default GroupCard
