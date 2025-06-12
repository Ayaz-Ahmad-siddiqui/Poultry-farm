// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../redux/Hooks/Hooks'; // Adjust path as needed

interface ProtectedRouteProps {
  
  children?: React.ReactNode; 
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  
  if (loading) {
    
    return <div>Loading authentication...</div>; 
  }

  
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login.");
    return <Navigate to="/login" replace />;
  }

  
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;