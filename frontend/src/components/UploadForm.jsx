import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { submissionsAPI } from '../services/api'

const UploadForm = ({ groupId, studentId, onSuccess }) => {
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('student_id', studentId)
      formData.append('group_id', groupId)
      
      try {
        toast.loading('Uploading...', { id: 'upload' })
        await submissionsAPI.uploadSubmission(formData)
        toast.success('Submission uploaded successfully!', { id: 'upload' })
        onSuccess()
      } catch (error) {
        toast.error('Upload failed: ' + error.message, { id: 'upload' })
      }
    }
  }, [groupId, studentId, onSuccess])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg']
    },
    maxFiles: 1
  })

  return (
    <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-400 transition-colors group">
      <div {...getRootProps()} className="cursor-pointer focus:outline-none">
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
            isDragActive 
              ? 'bg-blue-100 border-2 border-blue-400' 
              : 'bg-gray-100 group-hover:bg-blue-50'
          }`}>
            <Upload className={`h-8 w-8 ${isDragActive ? 'text-blue-600' : 'text-gray-500'} transition-colors`} />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900 mb-1">Drop your file here</p>
            <p className="text-sm text-gray-500">or click to browse <span className="font-semibold text-blue-600">(PDF, PNG, JPEG)</span></p>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-4">Max file size: 10MB</p>
    </div>
  )
}

export default UploadForm

