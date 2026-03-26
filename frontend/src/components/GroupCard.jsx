const GroupCard = ({ group }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
      <h3 className="font-semibold text-xl text-gray-900 mb-3">{group.name}</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Students:</span>
          <span className="font-medium text-gray-900">6</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Submissions:</span>
          <span className="font-medium text-gray-900">{group.submissions?.length || 0}</span>
        </div>
      </div>
      <button className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors font-medium">
        View Details
      </button>
    </div>
  )
}

export default GroupCard
