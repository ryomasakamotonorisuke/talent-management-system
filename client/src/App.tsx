import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// ページコンポーネント
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TraineeListPage from './pages/TraineeListPage';
import TraineeDetailPage from './pages/TraineeDetailPage';
import TraineeCreatePage from './pages/TraineeCreatePage';
import TraineeEditPage from './pages/TraineeEditPage';
import CertificatePage from './pages/CertificatePage';
import EvaluationPage from './pages/EvaluationPage';
import DevelopmentPlanPage from './pages/DevelopmentPlanPage';
import InterviewPage from './pages/InterviewPage';
import UserManagementPage from './pages/UserManagementPage';
import ProfilePage from './pages/ProfilePage';

// レイアウトコンポーネント
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// React Query クライアントの設定
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5分
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* 公開ルート */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* 保護されたルート */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                {/* ダッシュボード */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                
                {/* 実習生管理 */}
                <Route path="trainees" element={<TraineeListPage />} />
                <Route path="trainees/new" element={<TraineeCreatePage />} />
                <Route path="trainees/:id" element={<TraineeDetailPage />} />
                <Route path="trainees/:id/edit" element={<TraineeEditPage />} />
                
                {/* 資格・証明書管理 */}
                <Route path="certificates" element={<CertificatePage />} />
                
                {/* スキル評価 */}
                <Route path="evaluations" element={<EvaluationPage />} />
                
                {/* 育成計画 */}
                <Route path="development-plans" element={<DevelopmentPlanPage />} />
                
                {/* 面談記録 */}
                <Route path="interviews" element={<InterviewPage />} />
                
                {/* ユーザー管理（管理者のみ） */}
                <Route path="users" element={<UserManagementPage />} />
                
                {/* プロフィール */}
                <Route path="profile" element={<ProfilePage />} />
              </Route>
              
              {/* 404ページ */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            
            {/* トースト通知 */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

