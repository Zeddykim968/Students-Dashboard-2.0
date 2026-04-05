import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { submissionsAPI } from '../services/api'
import GroupChat from './GroupChat'
import { toast } from 'react-hot-toast'
import {
  Upload, Download, FileText, Image, Star, MessageSquare,
  Users, CheckCircle, Clock, Trash2, File
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'

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

const FILE_FORMATS = 'PDF, PNG, JPG, DWG, DXF, SVG, DOCX, PPTX, ZIP, MP4'

function getFileIcon(fileName) {
  if (!fileName) return <File className="h-8 w-8 text-gray-400" />
  const ext = fileName.split('.').pop().toLowerCase()
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext))
    return <Image className="h-8 w-8 text-green-500" />
  if (ext === 'pdf')
    return <FileText className="h-8 w-8 text-red-500" />
  if (['dwg', 'dxf'].includes(ext))
    return <FileText className="h-8 w-8 text-blue-600" />
  return <File className="h-8 w-8 text-gray-500" />
}

function isImage(url) {
  if (!url) return false
  return /\.(png|jpg|jpeg|gif|webp)$/i.test(url)
}

const GRADE_COLORS = {
  A: 'bg-green-100 text-green-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-yellow-100 text-yellow-700',
  D: 'bg-orange-100 text-orange-700',
  E: 'bg-red-100 text-red-700',
  F: 'bg-red-100 text-red-700',
}

function GradeForm({ submission, onSaved }) {
  const [grade, setGrade] = useState(submission?.grade || '')
  const [comment, setComment] = useState(submission?.lecturer_comment || '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await submissionsAPI.grade(submission.id, { grade, lecturer_comment: comment })
      toast.success('Grade saved')
      onSaved()
    } catch { toast.error('Failed to save grade') }
    finally { setSaving(false) }
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
      <div className="flex gap-2">
        <select
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-purple-400 focus:outline-none"
        >
          <option value="">Select grade</option>
          {['A', 'B', 'C', 'D', 'E', 'F'].map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <button
          onClick={save}
          disabled={saving}
          className="text-xs bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? '...' : 'Save'}
        </button>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add comment..."
        rows={2}
        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-purple-400 focus:outline-none resize-none"
      />
    </div>
  )
}

function UploadSlot({ groupId, studentId, onUploaded }) {
  const [desc, setDesc] = useState('')
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(async (files) => {
    const file = files[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('student_id', studentId)
    fd.append('group_id', groupId)
    fd.append('description', desc)
    try {
      await submissionsAPI.create(fd)
      toast.success('Uploaded!')
      setDesc('')
      onUploaded()
    } catch (e) { toast.error(e.message) }
    finally { setUploading(false) }
  }, [groupId, studentId, desc, onUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ACCEPTED, maxFiles: 1, disabled: uploading
  })

  return (
    <div className="mt-3 space-y-2">
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Add a description / explanation of your work..."
        rows={2}
        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-blue-400 focus:outline-none resize-none"
      />
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all ${
          isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/40'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-5 w-5 text-gray-400 mx-auto mb-1" />
        <p className="text-xs text-gray-500">
          {uploading ? 'Uploading...' : isDragActive ? 'Drop here' : 'Click or drag file'}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">{FILE_FORMATS}</p>
      </div>
    </div>
  )
}

function StudentSlot({ student, submission, isMe, isLecturer, groupId, onRefresh }) {
  const initials = student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Delete this submission?')) return
    setDeleting(true)
    try {
      await submissionsAPI.delete(submission.id)
      toast.success('Submission deleted')
      onRefresh()
    } catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  return (
    <div className={`bg-white rounded-2xl border-2 p-4 transition-all ${
      isMe ? 'border-blue-300 shadow-md shadow-blue-50' : 'border-gray-100 shadow-sm'
    }`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
          isMe ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
        }`}>
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{student.name}</p>
          <p className="text-xs text-gray-400">{student.reg_no}</p>
        </div>
        {isMe && (
          <span className="ml-auto text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
            You
          </span>
        )}
      </div>

      {submission ? (
        <div>
          <div className="bg-gray-50 rounded-xl p-3 space-y-2">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">{getFileIcon(submission.file_name)}</div>
              <div className="min-w-0 flex-1">
                {isImage(submission.file_url) ? (
                  <a href={submission.file_url} target="_blank" rel="noreferrer">
                    <img
                      src={submission.file_url}
                      alt="submission"
                      className="rounded-lg max-h-32 w-full object-cover mb-1 hover:opacity-90 transition-opacity"
                    />
                  </a>
                ) : null}
                <p className="text-xs font-medium text-gray-700 truncate">{submission.file_name}</p>
                <p className="text-xs text-gray-400">
                  {new Date(submission.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {submission.description && (
              <p className="text-xs text-gray-600 bg-white rounded-lg px-3 py-2 border border-gray-100">
                {submission.description}
              </p>
            )}

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {submission.grade && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${GRADE_COLORS[submission.grade] || 'bg-gray-100 text-gray-700'}`}>
                  Grade: {submission.grade}
                </span>
              )}
              <a
                href={submissionsAPI.downloadUrl(submission.id)}
                download
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                <Download className="h-3 w-3" /> Download
              </a>
              {(isMe || isLecturer) && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 ml-auto"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>

            {submission.lecturer_comment && (
              <div className="bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
                <p className="text-xs font-medium text-purple-700 mb-0.5">Lecturer feedback</p>
                <p className="text-xs text-purple-600">{submission.lecturer_comment}</p>
              </div>
            )}
          </div>

          {isLecturer && (
            <GradeForm submission={submission} onSaved={onRefresh} />
          )}

          {isMe && !isLecturer && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-1 font-medium">Replace submission</p>
              <UploadSlot groupId={groupId} studentId={student.id} onUploaded={onRefresh} />
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Clock className="h-4 w-4" />
            <span className="text-xs">No submission yet</span>
          </div>
          {isMe && !isLecturer && (
            <UploadSlot groupId={groupId} studentId={student.id} onUploaded={onRefresh} />
          )}
        </div>
      )}
    </div>
  )
}

const GroupView = ({ group }) => {
  const { user, role } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [tab, setTab] = useState('work')

  const fetchSubmissions = async () => {
    if (!group?.id) return
    try {
      const data = await submissionsAPI.getByGroup(group.id)
      setSubmissions(data)
    } catch { toast.error('Failed to load submissions') }
  }

  useEffect(() => {
    fetchSubmissions()
  }, [group?.id])

  if (!group) return null

  const students = (group.students || []).filter(s => s.role !== 'lecturer')
  const isLecturer = role === 'lecturer'
  const submittedCount = students.filter(s => submissions.some(sub => sub.student_id === s.id)).length

  const latestSubmission = (studentId) =>
    submissions.filter(s => s.student_id === studentId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-7 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold">{group.name}</h1>
              <p className="text-blue-100 mt-1 text-sm">{students.length} members</p>
            </div>
            <div className="flex gap-3">
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-2xl text-center">
                <p className="text-xl font-bold">{submittedCount}</p>
                <p className="text-xs text-blue-100">Submitted</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-2xl text-center">
                <p className="text-xl font-bold">{students.length - submittedCount}</p>
                <p className="text-xs text-blue-100">Pending</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 pb-0">
        <button
          onClick={() => setTab('work')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all border-b-2 ${
            tab === 'work'
              ? 'border-blue-500 text-blue-600 bg-blue-50/60'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="h-4 w-4" /> Group Work
        </button>
        <button
          onClick={() => setTab('chat')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all border-b-2 ${
            tab === 'chat'
              ? 'border-blue-500 text-blue-600 bg-blue-50/60'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare className="h-4 w-4" /> Discussion
        </button>
      </div>

      {tab === 'work' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {students.map((student) => (
            <StudentSlot
              key={student.id}
              student={student}
              submission={latestSubmission(student.id)}
              isMe={student.id === user?.id}
              isLecturer={isLecturer}
              groupId={group.id}
              onRefresh={fetchSubmissions}
            />
          ))}
          {students.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <Users className="mx-auto h-12 w-12 mb-3" />
              <p>No students in this group yet</p>
            </div>
          )}
        </div>
      )}

      {tab === 'chat' && (
        <GroupChat groupId={group.id} />
      )}
    </div>
  )
}

export default GroupView
