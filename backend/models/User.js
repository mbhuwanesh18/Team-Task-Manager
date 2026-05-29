import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name field cannot be left empty'],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email field is mandatory'], 
    unique: true, 
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: [true, 'Password verification hash is required'] 
  },
  role: { 
    type: String, 
    enum: {
      values: ['Admin', 'Member'],
      message: '{VALUE} is not a valid framework role'
    },
    default: 'Member' 
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);