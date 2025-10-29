import React from 'react';
import { useQuery } from 'react-query';
import { 
  Users, 
  UserPlus, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Award,
  FileText,
  MessageSquare
} from 'lucide-react';
import { dashboardApi } from '../services/api';
import { DashboardStats, DashboardAlerts } from '../types';

const DashboardPage: React.FC = () => {
  // 統計データの取得
  const { data: statsData, isLoading: statsLoading } = useQuery(
    'dashboard-stats',
    () => dashboardApi.getStats(),
    {
      refetchInterval: 5 * 60 * 1000, // 5分ごとに更新
    }
  );

  // アラートデータの取得
  const { data: alertsData, isLoading: alertsLoading } = useQuery(
    'dashboard-alerts',
    () => dashboardApi.getAlerts(),
    {
      refetchInterval: 2 * 60 * 1000, // 2分ごとに更新
    }
  );

  const stats = statsData?.data;
  const alerts = alertsData?.data;

  if (statsLoading || alertsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="mt-1 text-sm text-gray-600">
          海外技能実習生の管理状況と重要なアラートを確認できます
        </p>
      </div>

      {/* 最重要アラート */}
      {alerts && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 在留期限アラート */}
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">在留期限アラート</p>
                <p className="text-2xl font-bold text-red-600">
                  {alerts.visaExpiry.length}
                </p>
                <p className="text-xs text-gray-500">60日以内</p>
              </div>
            </div>
          </div>

          {/* 資格期限アラート */}
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">資格期限アラート</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {alerts.certificateExpiry.length}
                </p>
                <p className="text-xs text-gray-500">30日以内</p>
              </div>
            </div>
          </div>

          {/* 健康診断期限アラート */}
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">健康診断期限</p>
                <p className="text-2xl font-bold text-blue-600">
                  {alerts.healthCheckDue.length}
                </p>
                <p className="text-xs text-gray-500">90日以内</p>
              </div>
            </div>
          </div>

          {/* 評価期限アラート */}
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">評価期限</p>
                <p className="text-2xl font-bold text-purple-600">
                  {alerts.evaluationDue.length}
                </p>
                <p className="text-xs text-gray-500">未入力</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 全体サマリー */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 基本統計 */}
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4">基本統計</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 bg-blue-100 rounded-lg mx-auto mb-2">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTrainees}</p>
                  <p className="text-sm text-gray-500">実習生総数</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 bg-green-100 rounded-lg mx-auto mb-2">
                    <UserPlus className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.newTrainees}</p>
                  <p className="text-sm text-gray-500">新規入国者（3ヶ月）</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 bg-purple-100 rounded-lg mx-auto mb-2">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageSkillLevel.toFixed(1)}</p>
                  <p className="text-sm text-gray-500">平均スキル習熟度</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 bg-yellow-100 rounded-lg mx-auto mb-2">
                    <Calendar className="h-6 w-6 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{alerts?.interviewDue.length || 0}</p>
                  <p className="text-sm text-gray-500">面談未実施</p>
                </div>
              </div>
            </div>
          </div>

          {/* 国籍別統計 */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">国籍別統計</h3>
            <div className="space-y-3">
              {stats.nationalityStats.slice(0, 5).map((stat, index) => (
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
        </div>
      )}

      {/* 部署別統計 */}
      {stats && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">部署別統計</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.departmentStats.map((stat) => (
              <div key={stat.department} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{stat.department}</span>
                  <span className="text-lg font-bold text-blue-600">{stat.count}</span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(stat.count / stats.totalTrainees) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* アラート詳細 */}
      {alerts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 在留期限アラート詳細 */}
          {alerts.visaExpiry.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                在留期限アラート
              </h3>
              <div className="space-y-2">
                {alerts.visaExpiry.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {alert.lastName} {alert.firstName}
                      </p>
                      <p className="text-xs text-gray-500">{alert.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">
                        {new Date(alert.visaExpiryDate).toLocaleDateString('ja-JP')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.ceil((new Date(alert.visaExpiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}日後
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 資格期限アラート詳細 */}
          {alerts.certificateExpiry.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Award className="h-5 w-5 text-yellow-600 mr-2" />
                資格期限アラート
              </h3>
              <div className="space-y-2">
                {alerts.certificateExpiry.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{alert.name}</p>
                      <p className="text-xs text-gray-500">
                        {alert.trainee.lastName} {alert.trainee.firstName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-yellow-600">
                        {new Date(alert.expiryDate).toLocaleDateString('ja-JP')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.ceil((new Date(alert.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}日後
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

