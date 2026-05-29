import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const auth = useContext(AuthContext);

  // Safety Break 1: Agar context abhi init nahi hua, toh loading screen dikhao, login par mat feko
  if (!auth) {
    return <div className="p-6 text-center text-gray-500">Authenticating Guard...</div>;
  }

  // Safety Break 2: Agar local token check fail ho jaye tabhi login par bhejo
  const token = auth.token || localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;