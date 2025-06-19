
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader } from 'lucide-react'; 
import { useAuth } from './context/AuthContext';

const AuthRedirector = () => {
  const { currentUser, authLoading } = useAuth();

  
  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (currentUser) {
 
    return <Navigate to="/zurl" replace />;
  } else {
   
    return <Outlet />;
  }
};

export default AuthRedirector;