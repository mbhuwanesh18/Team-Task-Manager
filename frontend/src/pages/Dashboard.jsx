import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  
  // New States for Relational Team Management and Global Metrics
  const [allMembers, setAllMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [metrics, setMetrics] = useState({ completedTasks: 0, pendingTasks: 0 });
  
  const navigate = useNavigate();

  // Fetch Projects From Live Connected Backend
  const fetchProjects = async () => {
    try {
      const res = await API.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects from DB:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Global Task Counters from Backend
  const fetchGlobalMetrics = async () => {
    try {
      const res = await API.get('/tasks/global-metrics');
      setMetrics(res.data);
    } catch (err) {
      console.error("Error fetching global metrics:", err);
    }
  };

  // Fetch Active Members List from User Database (Admin Only)
  const fetchTeamMembers = async () => {
    try {
      const res = await API.get('/auth/members');
      setAllMembers(res.data);
    } catch (err) {
      console.error("Error fetching squad context from DB:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchGlobalMetrics(); // Updates task counts on load
    if (user?.role === 'Admin') {
      fetchTeamMembers();
    }
  }, [user]);

  // Create Project Function with Clean Multi-Select Array Processing
  const handleCreateProject = async (e) => {
    e.preventDefault();
    
    if (user?.role === 'Admin' && selectedMembers.length === 0) {
      alert("Please select at least one team member from the list to assign this project!");
      return;
    }

    try {
      const res = await API.post('/projects', { 
        title, 
        description,
        members: selectedMembers // Submitting array of IDs safely to the database
      });
      
      setProjects([...projects, res.data.project]);
      setShowModal(false);
      setTitle('');
      setDescription('');
      setSelectedMembers([]); // Reset array state after clean deployment
    } catch (err) {
      alert(err.response?.data?.message || "Project creation failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Top Navbar Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-6 flex justify-between items-center border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            Hi, {user?.name || 'User'} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Role: <span className={`font-semibold ${user?.role === 'Admin' ? 'text-red-600' : 'text-blue-600'}`}>{user?.role}</span>
          </p>
        </div>
        <button onClick={logout} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-medium transition cursor-pointer">
          Logout
        </button>
      </div>

      {/* Dynamic Counter Statistics Grid Layout - UPGRADED WITH GLOBAL TASK COUNTERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-600">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Projects Managed</p>
          <p className="text-3xl font-extrabold text-gray-800 mt-2">{projects.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-600">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tasks Completed</p>
          <p className="text-3xl font-extrabold text-green-600 mt-2">{metrics.completedTasks}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-amber-500">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Tasks</p>
          <p className="text-3xl font-extrabold text-amber-500 mt-2">{metrics.pendingTasks}</p>
        </div>
      </div>

      {/* Projects List Container */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Assigned Projects</h2>
          {user?.role === 'Admin' && (
            <button 
              onClick={() => setShowModal(true)} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition flex items-center gap-1 cursor-pointer"
            >
              + Create Project
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-6 text-gray-500">Loading your project synchronization workspace...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
            No projects available yet. Create one to begin task allocations!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <div 
                key={project._id} 
                onClick={() => navigate(`/project/${project._id}`)}
                className="p-5 border border-gray-200 rounded-xl hover:border-blue-500 transition shadow-sm hover:shadow-md cursor-pointer bg-white"
              >
                <h3 className="font-bold text-lg text-gray-800">{project.title}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description || 'No description added.'}</p>
                <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
                  <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                  <span className="text-blue-500 font-medium">Open Scrum Board →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Action: Create Project Modal Dialog Popup */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Launch New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Project Title</label>
                <input 
                  type="text" required className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Cyber Security Vault"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea 
                  rows="3" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief system scope briefing..."
                />
              </div>

              {/* Dynamic Selection Dropdown List for Team Members */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Assign Team Members</label>
                <select 
                  multiple
                  className="w-full p-2.5 border border-gray-300 rounded-lg h-28 outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 font-medium text-sm"
                  value={selectedMembers}
                  onChange={(e) => {
                    const values = Array.from(e.target.selectedOptions, option => option.value);
                    setSelectedMembers(values);
                  }}
                >
                  {allMembers.map(member => (
                    <option key={member._id} value={member._id} className="p-1.5 border-b border-gray-50 checked:bg-blue-100 text-gray-800">
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">*Click on the name to highlight. Hold Ctrl (Windows) or Cmd (Mac) to select multiple.</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" onClick={() => { setShowModal(false); setSelectedMembers([]); }}
                  className="px-4 py-2 text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow-sm">
                  Deploy Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;