'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';

interface Trainee {
  id: string;
  trainee_id: string;
  first_name: string;
  last_name: string;
  nationality: string;
  department: string;
  visa_expiry_date: string;
  created_at: string;
}

interface Stats {
  totalTrainees: number;
  nationalityStats: Array<{
    nationality: string;
    count: number;
  }>;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [stats, setStats] = useState<Stats>({ totalTrainees: 0, nationalityStats: [] });
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // 実習生データの取得
      const traineesResponse = await fetch('/api/supabase?action=get-trainees');
      const traineesData = await traineesResponse.json();
      setTrainees(traineesData.trainees || []);

      // 統計データの取得
      const statsResponse = await fetch('/api/supabase?action=get-stats');
      const statsData = await statsResponse.json();
      setStats(statsData);

    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setDataLoading(false);
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">ログインが必要です</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="mt-1 text-sm text-gray-600">
          Supabase認証でログイン中: {user.email}
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">実習生総数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTrainees}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold">🌍</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">国籍数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.nationalityStats.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold">🏢</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">部署数</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(trainees.map(t => t.department)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 font-bold">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">データ更新</p>
              <p className="text-sm font-bold text-gray-900">リアルタイム</p>
            </div>
          </div>
        </div>
      </div>

      {/* 国籍別統計 */}
      {stats.nationalityStats.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">国籍別統計</h3>
          <div className="space-y-3">
            {stats.nationalityStats.map((stat) => (
              <div key={stat.nationality} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{stat.nationality}</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(stat.count / stats.totalTrainees) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{stat.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 実習生一覧 */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">実習生一覧</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  実習生ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  氏名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  国籍
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  部署
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  在留期限
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trainees.map((trainee) => (
                <tr key={trainee.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {trainee.trainee_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trainee.last_name} {trainee.first_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trainee.nationality}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trainee.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(trainee.visa_expiry_date).toLocaleDateString('ja-JP')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}