import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const MemberAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isLogin ? '/auth/login' : '/auth/signup';
    // Member flow me role bypass field automatic 'Member' locked hai
    const payload = isLogin ? { email, password } : { name, email, password, role: 'Member' };

    try {
      const res = await API.post(endpoint, payload);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border-t-4 border-blue-600">
        <div className="text-center mb-6">
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Workspace
          </span>
          <h2 className="text-3xl font-extrabold text-gray-800 mt-2">Member Portal</h2>
          <p className="text-sm text-gray-500 mt-1">Access your assigned task boards</p>
        </div>

        {error && <div className="mb-4 text-sm p-3 bg-red-50 text-red-700 rounded-lg font-medium">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
              <input type="text" required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Work Email</label>
            <input type="email" required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input type="password" required className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white p-2.5 rounded-lg font-bold hover:bg-blue-700 transition shadow-md">
            {isLogin ? 'Sign In to Workspace' : 'Join as Team Member'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:underline font-semibold">
            {isLogin ? 'New to the team? Request access' : 'Already have a member profile? Login'}
          </button>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button onClick={() => navigate('/admin')} className="text-xs text-gray-400 hover:text-slate-600">
              Access Admin Control Room →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberAuth;