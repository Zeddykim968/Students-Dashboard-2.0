import { Users } from 'lucide-react'

const MemberList = ({ members, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <Users className="h-6 w-6 text-gray-500 mr-2" />
        <h3 className="font-semibold text-lg text-gray-900">Members ({members.length})</h3>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {members.map((member) => (
          <div key={member.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {member.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
              <p className="text-sm text-gray-500 truncate">{member.email}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              member.role === 'student' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-purple-100 text-purple-800'
            }`}>
              {member.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MemberList

