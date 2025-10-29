import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireAdminOrDepartment?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false, 
  requireAdminOrDepartment = false 
}) => {
  const { user, isLoading } = useAuth();

  // ローディング中
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 未認証の場合
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 管理者権限が必要な場合
  if (requireAdmin && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  // 管理者または部署権限が必要な場合
  if (requireAdminOrDepartment && user.role !== 'ADMIN' && user.role !== 'DEPARTMENT') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

