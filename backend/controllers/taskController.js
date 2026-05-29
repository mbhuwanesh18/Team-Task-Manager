import Task from '../models/Task.js';
import Project from '../models/Project.js';

// @desc    Create a new task and populate its relational contexts (Admin Only)
// @route   POST /api/tasks
export const createTask = async (req, res) => {
  const { title, description, projectId, assignedTo } = req.body;

  try {
    // Basic backend checking verification
    if (!title || !projectId || !assignedTo) {
      return res.status(400).json({ message: 'Missing parameters. Title, Project ID, and Assignee are required.' });
    }

    // Creating document with accurate mapped fields
    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      project: projectId,
      assignedTo: assignedTo, // Variable sync matched
      status: 'To Do'
    });

    // Populate relational details before sending the json output data to screen grid
    const fullyPopulatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email role');

    res.status(201).json({ 
      message: 'Task deployed and bound to member successfully', 
      task: fullyPopulatedTask 
    });
  } catch (error) {
    res.status(400).json({ message: 'Task deployment failed', error: error.message });
  }
};

// @desc    Fetch all tasks for a specific project with populated assignee name
// @route   GET /api/tasks/project/:projectId
export const getProjectTasks = async (req, res) => {
  const { projectId } = req.params;

  try {
    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email role');
      
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch project agile lane tasks', error: error.message });
  }
};

// @desc    Update task execution column status
// @route   PUT /api/tasks/:id
export const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('assignedTo', 'name email role');

    if (!updatedTask) {
      return res.status(404).json({ message: 'Requested task node not found' });
    }

    res.json({ message: 'Task status updated cleanly', task: updatedTask });
  } catch (error) {
    res.status(400).json({ message: 'Failed to advance task status', error: error.message });
  }
};