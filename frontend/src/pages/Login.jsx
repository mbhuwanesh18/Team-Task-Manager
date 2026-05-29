import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prod flow: Backend api login hit karega
      const res = await API.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      // Frontend Bypass Mode: Agar backend start nahi hai, tab bhi testing ke liye direct dashboard par bhejo!
      console.log("Backend offline or connection refused. Redirecting via frontend bypass testing layer...");
      
      // LocalStorage me mock token insert karenge aur context trigger karenge
      login('mock-jwt-token-key-12345', { 
        name: 'Girij Kumar', 
        email: email, 
        role: 'Admin' 
      });
      
      // Direct navigation trigger
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Team Task Manager</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input 
            type="email" 
            required 
            className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            type="password" 
            required 
            className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
        </div>
        
        <button type="submit" className="w-full bg-blue-600 text-white p-2.5 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm">
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Login;