import { useState, useEffect } from 'react';
import API from '../../services/api';

const CreateTaskModal = ({ isOpen, onClose, projectId, onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To Do');
  const [assigneeId, setAssigneeId] = useState('');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && projectId) {
      const fetchProjectMembers = async () => {
        try {
          const res = await API.get(`/projects/${projectId}/members`);
          setMembers(res.data);
        } catch (err) {
          console.error("Failed to load project members", err);
        }
      };
      fetchProjectMembers();
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { title, description, status, assignee_id: assigneeId || null };
      const res = await API.post(`/projects/${projectId}/tasks`, payload);
      onTaskCreated(res.data.task);
      setTitle('');
      setDescription('');
      setStatus('To Do');
      setAssigneeId('');
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Task creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Create New Project Task</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-semibold">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Task Title</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-24" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-2.5 border rounded-lg bg-white">
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Assignee</label>
              <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="w-full p-2.5 border rounded-lg bg-white">
                <option value="">Unassigned</option>
                {members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
            {loading ? 'Saving...' : 'Save Task'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;