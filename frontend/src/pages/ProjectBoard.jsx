import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const ProjectBoard = () => {
  const { id } = useParams(); 
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]); 
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [assignedTo, setAssignedTo] = useState(''); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const columns = ['To Do', 'In Progress', 'Review', 'Done'];

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch populated tasks for this specific board layout
      const taskRes = await API.get(`/tasks/project/${id}`);
      setTasks(taskRes.data);

      // 2. Fetch project workspace with populated relational structures
      const projectRes = await API.get('/projects');
      const currentProject = projectRes.data.find(p => p._id === id);
      
      if (currentProject && currentProject.members) {
        setProjectMembers(currentProject.members);
      }
    } catch (err) {
      console.error("Failed to compile project boards workflow:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProjectData();
    }
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();

    if (!assignedTo) {
      alert("Please select a team member from the dropdown list to delegate this task!");
      return;
    }

    try {
      await API.post('/tasks', {
        title: taskTitle,
        description: taskDesc,
        projectId: id,
        assignedTo: assignedTo // Direct MongoDB structural reference payload binding
      });
      
      // Full fresh state pull to load dynamic cards smoothly
      await fetchProjectData();
      
      setShowTaskModal(false);
      setTaskTitle('');
      setTaskDesc('');
      setAssignedTo('');
    } catch (err) {
      alert("Task allocation failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleMoveTask = async (taskId, currentStatus) => {
    const currentIndex = columns.indexOf(currentStatus);
    if (currentIndex === columns.length - 1) return; 

    const nextStatus = columns[currentIndex + 1];
    try {
      const res = await API.put(`/tasks/${taskId}`, { status: nextStatus });
      setTasks(prevTasks => 
        prevTasks.map(t => t._id === taskId ? { ...t, status: res.data.task.status } : t)
      );
    } catch (err) {
      alert("Failed to increment Kanban execution stage: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Panel */}
      <div className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="text-sm font-bold text-blue-600 hover:text-blue-700 transition cursor-pointer"
        >
          ← Back to All Projects
        </button>
        <div className="text-center">
          <h2 className="text-base font-bold text-gray-700">Project Agile Board</h2>
        </div>
        {user?.role === 'Admin' ? (
          <button 
            onClick={() => setShowTaskModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition shadow-sm cursor-pointer text-sm"
          >
            + Assign New Task
          </button>
        ) : (
          <div className="text-xs bg-gray-100 text-gray-500 font-semibold px-3 py-1 rounded-full">Execution Mode</div>
        )}
      </div>

      {loading ? (
        <div className="p-10 text-center text-gray-500 font-medium">Syncing Scrum Columns with Atlas Instance...</div>
      ) : (
        /* Board Layout Grid Columns */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
          {columns.map((col) => (
            <div key={col} className="bg-gray-100/80 p-4 rounded-xl min-h-[500px] border border-gray-200/60 shadow-inner">
              <h3 className="font-bold text-gray-700 uppercase tracking-wide text-xs mb-4 flex justify-between items-center px-1">
                <span>{col}</span>
                <span className="bg-gray-200 text-gray-600 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {tasks.filter(t => t.status === col).length}
                </span>
              </h3>

              <div className="space-y-3">
                {tasks.filter(t => t.status === col).length === 0 ? (
                  <div className="text-center py-4 text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg">
                    Empty Column
                  </div>
                ) : (
                  tasks.filter(t => t.status === col).map((task) => (
                    <div key={task._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200/80 group hover:shadow-md transition duration-200">
                      
                      {/* Identity Visual Tag: Render Dynamic Employee Name */}
                      <div className="mb-2 flex items-center gap-1.5">
                        <span className="bg-blue-50 text-blue-600 text-[10px] font-extrabold px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wider">
                          {/* Checked safe syntax verification fallback render */}
                          👤 {task.assignedTo && typeof task.assignedTo === 'object' ? task.assignedTo.name : 'Assigned Member'}
                        </span>
                      </div>

                      <h4 className="font-bold text-gray-800 text-sm break-words">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-gray-500 mt-1.5 whitespace-pre-wrap break-words bg-gray-50 p-2 rounded-md border border-gray-100">
                          {task.description}
                        </p>
                      )}
                      
                      {col !== 'Done' && (
                        <button 
                          onClick={() => handleMoveTask(task._id, task.status)}
                          className="w-full mt-3 text-center text-xs font-bold py-2 bg-blue-50 border border-blue-100 rounded-md text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition duration-150 shadow-sm cursor-pointer"
                        >
                          Advance Status →
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Creation Modal Popup Dialog */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-100 animate-fadeIn">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Allocate Project Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Task Summary</label>
                <input 
                  type="text" required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="e.g., Integrate Phishing detection script"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Technical Specs</label>
                <textarea 
                  rows="3" className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  value={taskDesc} onChange={e => setTaskDesc(e.target.value)} placeholder="Write internal implementation guidelines..."
                />
              </div>

              {/* Verified Dropdown Collector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Assign To Developer</label>
                <select 
                  required
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 font-medium text-sm"
                  value={assignedTo}
                  onChange={e => setAssignedTo(e.target.value)}
                >
                  <option value="">-- Select Member --</option>
                  {projectMembers.map(member => {
                    const memberId = member._id || member;
                    const memberName = member.name || 'Member Account Linked';
                    return (
                      <option key={memberId} value={memberId}>
                        {memberName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" onClick={() => setShowTaskModal(false)} 
                  className="px-4 py-2 text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
                >
                  Deploy Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectBoard;