import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Users, Shield, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoginRequest } from '../types';

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { user, login, isLoading } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>();

  // 既にログインしている場合はダッシュボードへリダイレクト
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: LoginRequest) => {
    await login(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* ヘッダー */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            タレントマネジメントシステム
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            海外技能実習生の情報管理システム
          </p>
        </div>

        {/* ログインフォーム */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <div className="mt-1">
                <input
                  {...register('email', {
                    required: 'メールアドレスを入力してください',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: '有効なメールアドレスを入力してください'
                    }
                  })}
                  type="email"
                  autoComplete="email"
                  className="input-field"
                  placeholder="admin@talent-management.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                パスワード
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('password', {
                    required: 'パスワードを入力してください',
                    minLength: {
                      value: 6,
                      message: 'パスワードは6文字以上で入力してください'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="input-field pr-10"
                  placeholder="パスワード"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ログイン中...
                  </div>
                ) : (
                  'ログイン'
                )}
              </button>
            </div>
          </form>

          {/* デモアカウント情報 */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-3">デモアカウント</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-blue-600" />
                <span className="font-medium">管理者:</span>
                <span className="ml-2">admin@talent-management.com / admin123</span>
              </div>
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-2 text-green-600" />
                <span className="font-medium">部署担当者:</span>
                <span className="ml-2">dept@talent-management.com / dept123</span>
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2024 海外技能実習生タレントマネジメントシステム
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

