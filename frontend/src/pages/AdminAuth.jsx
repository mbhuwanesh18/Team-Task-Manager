import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const AdminAuth = () => {
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
    const payload = isLogin ? { email, password } : { name, email, password, role: 'Admin' };

    try {
      const res = await API.post(endpoint, payload);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Server unreachable.');
    }
  };

  return (
    <div style={{
      minHeight: '100-screen',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#111827', // Strong dark background for admin panel contrast
      padding: '0 1rem',
      height: '100vh'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '2rem',
        borderRadius: '0.75rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: '28rem',
        borderTop: '8px solid #dc2626' // Strong Red Border for Admin Control Panel
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Control Panel
          </span>
          <h2 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#1f2937', marginTop: '0.5rem' }}>
            Admin Portal
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Manage team projects & tracking
          </p>
        </div>

        {error && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            backgroundColor: '#fef2f2',
            color: '#b91c1c',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            border: '1px solid #fca5a5'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!isLogin && (
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>Full Name</label>
              <input 
                type="text" 
                required 
                style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', backgroundColor: '#ffffff', color: '#1f2937' }} 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>Admin Email</label>
            <input 
              type="email" 
              required 
              style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', backgroundColor: '#ffffff', color: '#1f2937' }} 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>Password</label>
            <input 
              type="password" 
              required 
              style={{ width: '100%', padding: '0.625rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', backgroundColor: '#ffffff', color: '#1f2937' }} 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>

          {/* Hard-Coded Native Inline Flex Button */}
          <button 
            type="submit" 
            style={{
              width: '100%',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              fontSize: '1rem',
              textAlign: 'center',
              marginTop: '0.5rem',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
          >
            {isLogin ? 'Sign In As Admin' : 'Create Admin Account'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem' }}>
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ textDecoration: 'none', color: '#dc2626', fontWeight: '600', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            {isLogin ? "Don't have an admin account? Register" : 'Already have an admin account? Login'}
          </button>
          
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
            <button 
              onClick={() => navigate('/member')} 
              style={{ color: '#2563eb', fontWeight: '500', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              Switch to Member Login →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;