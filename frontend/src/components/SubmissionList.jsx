import { FileText, Download, Clock } from 'lucide-react'
import { toast } from 'react-hot-toast'

const SubmissionList = ({ submissions, onRefresh }) => {
  const handleDownload = (fileUrl) => {
    // Trigger download
    window.open(fileUrl, '_blank')
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FileText className="h-6 w-6 text-gray-500 mr-2" />
          <h3 className="font-semibold text-lg text-gray-900">Submissions ({submissions.length})</h3>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            <Clock className="h-4 w-4 mr-1" />
            Refresh
          </button>
        )}
      </div>
      <div className="space-y-3">
        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No submissions yet</p>
          </div>
        ) : (
          submissions.map((submission) => (
            <div key={submission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{submission.title || 'Untitled Submission'}</p>
                  <p className="text-sm text-gray-500">{submission.student_name} • {new Date(submission.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  submission.status === 'graded' 
                    ? 'bg-green-100 text-green-800' 
                    : submission.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {submission.status || 'Pending'}
                </span>
                <button
                  onClick={() => handleDownload(submission.file_url)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Download file"
                >
                  <Download className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default SubmissionList

