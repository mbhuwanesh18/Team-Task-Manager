import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Task compilation requires a brief summary line'],
    trim: true 
  },
  description: { 
    type: String,
    trim: true 
  },
  status: { 
    type: String, 
    enum: ['To Do', 'In Progress', 'Review', 'Done'], 
    default: 'To Do' 
  },
  // Parent Project binding link
  project: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    required: true 
  },
  // Synced Variable Key Name to prevent controller collision
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: [true, 'Task must be assigned to an active team member']
  }
}, { timestamps: true });

export default mongoose.model('Task', taskSchema);