import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Project deployment requires a clear title'],
    trim: true 
  },
  description: { 
    type: String,
    trim: true 
  },
  // Relational Mapping: Single Admin Creator
  admin: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // Relational Mapping: Many Team Members
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }]
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);