import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminAuth from './pages/AdminAuth';
import MemberAuth from './pages/MemberAuth';
import Dashboard from './pages/Dashboard';
import ProjectBoard from './pages/ProjectBoard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Dedicated Sub-Portals */}
          <Route path="/admin" element={<AdminAuth />} />
          <Route path="/member" element={<MemberAuth />} />
          
          {/* Protected Main Operational Framework */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/project/:id" 
            element={
              <ProtectedRoute>
                <ProjectBoard />
              </ProtectedRoute>
            } 
          />

          {/* Fallback Core Link */}
          <Route path="*" element={<Navigate to="/member" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;