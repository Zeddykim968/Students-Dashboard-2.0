import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { submissionsAPI, groupsAPI } from '../services/api'
import { toast } from 'react-hot-toast'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Image, Download, Trash2, File, Clock, CheckCircle } from 'lucide-react'

const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],
  'application/octet-stream': ['.dwg', '.dxf'],
  'application/zip': ['.zip'],
  'application/vnd.rar': ['.rar'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'video/mp4': ['.mp4'],
}

function getFileIcon(fileName) {
  if (!fileName) return <File className="h-5 w-5 text-gray-400" />
  const ext = fileName.split('.').pop().toLowerCase()
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext))
    return <Image className="h-5 w-5 text-green-500" />
  if (ext === 'pdf') return <FileText className="h-5 w-5 text-red-500" />
  if (['dwg', 'dxf'].includes(ext)) return <FileText className="h-5 w-5 text-blue-600" />
  return <File className="h-5 w-5 text-gray-500" />
}

function isImage(url) {
  return url && /\.(png|jpg|jpeg|gif|webp)$/i.test(url)
}

const GRADE_COLORS = {
  A: 'bg-green-100 text-green-700', B: 'bg-blue-100 text-blue-700',
  C: 'bg-yellow-100 text-yellow-700', D: 'bg-orange-100 text-orange-700',
  E: 'bg-red-100 text-red-700', F: 'bg-red-100 text-red-700',
}

const MySubmissions = () => {
  const { user, updateUser } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [desc, setDesc] = useState('')
  const [uploading, setUploading] = useState(false)
  const [groupId, setGroupId] = useState(user?.group_id || null)

  const fetchSubmissions = async () => {
    if (!user?.id) return
    try {
      const data = await submissionsAPI.getByStudent(user.id)
      setSubmissions(data)
    } catch { toast.error('Failed to load submissions') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    const init = async () => {
      let gid = user?.group_id
      if (!gid && user?.id) {
        try {
          const grp = await groupsAPI.getMyGroup()
          if (grp?.id) {
            gid = grp.id
            setGroupId(grp.id)
            updateUser({ group_id: grp.id })
          }
        } catch {}
      } else if (gid) {
        setGroupId(gid)
      }
      fetchSubmissions()
    }
    init()
  }, [user?.id])

  const onDrop = useCallback(async (files) => {
    const file = files[0]
    if (!file || !user?.id) return
    const gid = groupId || user?.group_id
    if (!gid) {
      toast.error('You are not assigned to a group yet')
      return
    }
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('student_id', user.id)
    fd.append('group_id', gid)
    fd.append('description', desc)
    try {
      await submissionsAPI.create(fd)
      toast.success('Uploaded successfully!')
      setDesc('')
      fetchSubmissions()
    } catch (e) { toast.error(e.message) }
    finally { setUploading(false) }
  }, [user, groupId, desc])

  const handleDelete = async (id) => {
    if (!confirm('Delete this submission?')) return
    try {
      await submissionsAPI.delete(id)
      toast.success('Deleted')
      fetchSubmissions()
    } catch { toast.error('Delete failed') }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ACCEPTED, maxFiles: 1, disabled: uploading
  })

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
    </div>
  )

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Submissions</h1>
        <p className="text-gray-500 mt-1">Upload and manage your assignment work</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5 text-blue-500" /> Upload New Submission
        </h2>
        <div className="space-y-3">
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Describe your work, approach, or design decisions..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
          />
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/40'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-700">
              {uploading ? 'Uploading...' : isDragActive ? 'Drop your file here' : 'Click or drag & drop'}
            </p>
            <p className="text-xs text-gray-400 mt-1">PDF, PNG, JPG, DWG, DXF, SVG, DOCX, PPTX, ZIP, MP4</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Submission History ({submissions.length})
        </h2>
        {submissions.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-10 text-center text-gray-400 border-2 border-dashed border-gray-200">
            <Clock className="mx-auto h-10 w-10 mb-3 text-gray-300" />
            <p className="font-medium">No submissions yet</p>
            <p className="text-sm mt-1">Upload your first file above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub, idx) => (
              <div key={sub.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    {getFileIcon(sub.file_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        {idx === 0 && (
                          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium mr-2">
                            Latest
                          </span>
                        )}
                        <span className="font-medium text-gray-900">{sub.file_name}</span>
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {sub.description && (
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg px-3 py-2">{sub.description}</p>
                    )}

                    {isImage(sub.file_url) && (
                      <a href={sub.file_url} target="_blank" rel="noreferrer">
                        <img src={sub.file_url} alt="preview" className="mt-3 max-h-40 rounded-xl object-cover hover:opacity-90 transition-opacity" />
                      </a>
                    )}

                    {(sub.grade || sub.lecturer_comment) && (
                      <div className="mt-3 bg-purple-50 border border-purple-100 rounded-xl p-3">
                        {sub.grade && (
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full mr-2 ${GRADE_COLORS[sub.grade] || 'bg-gray-100 text-gray-700'}`}>
                            Grade: {sub.grade}
                          </span>
                        )}
                        {sub.lecturer_comment && (
                          <p className="text-sm text-purple-700 mt-2">{sub.lecturer_comment}</p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-3">
                      <a
                        href={submissionsAPI.downloadUrl(sub.id)}
                        download
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <Download className="h-4 w-4" /> Download
                      </a>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="flex items-center gap-1 text-sm text-red-400 hover:text-red-600 ml-auto"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MySubmissions
