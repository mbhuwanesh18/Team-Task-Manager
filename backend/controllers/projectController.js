import Project from '../models/Project.js';
import mongoose from 'mongoose';

// @desc    Deploy Project with explicit casted ObjectIds (Admin Only)
// @route   POST /api/projects
export const createProject = async (req, res) => {
  const { title, description, members } = req.body;

  try {
    // Structural Safety Check: Title empty nahi hona chahiye
    if (!title || title.trim() === "") {
      return res.status(400).json({ message: 'Project title cannot be left blank.' });
    }

    // Convert string IDs into clean MongoDB database ObjectIds arrays safely
    const formattedMembers = members && Array.isArray(members) 
      ? members.map(id => new mongoose.Types.ObjectId(id)) 
      : [];

    // Create the project document with strict relationship bindings
    const project = await Project.create({
      title,
      description,
      admin: req.user._id, // Set logged-in Admin as creator from auth middleware
      members: formattedMembers // Store whitelisted member array references
    });

    // Populate members data instantly before returning layout response to frontend
    const fullyMappedProject = await Project.findById(project._id)
      .populate('members', 'name email role')
      .populate('admin', 'name email role');

    res.status(201).json({ 
      message: 'Project successfully mapped in DB instance', 
      project: fullyMappedProject 
    });
  } catch (error) {
    res.status(400).json({ message: 'Validation check failed', error: error.message });
  }
};

// @desc    Role Based Access Control Filtered Projects Fetch
// @route   GET /api/projects
export const getProjects = async (req, res) => {
  try {
    let projects;
    
    // Strict Database Identity Isolation Routing (RBAC Check)
    if (req.user.role === 'Admin') {
      // Admin will view all projects created by them
      projects = await Project.find({ admin: req.user._id }).populate('members', 'name email role');
    } else {
      // Member will only view projects where their individual ID resides inside the team array list
      projects = await Project.find({ members: req.user._id }).populate('admin', 'name email role');
    }
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Relational data query crashed', error: error.message });
  }
};