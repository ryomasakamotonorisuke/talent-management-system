import React from 'react';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                海外技能実習生タレントマネジメントシステム
              </h1>
              <p className="text-gray-600 mb-8">
                実習生の情報、資格、スキル、育成計画、評価履歴を一元管理
              </p>
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-2">デモアカウント</h2>
                  <div className="space-y-2 text-sm">
                    <p><strong>管理者:</strong> admin@talent-management.com / admin123</p>
                    <p><strong>部署担当者:</strong> dept@talent-management.com / dept123</p>
                  </div>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">主要機能</h3>
                  <ul className="text-blue-800 space-y-1">
                    <li>• 実習生台帳管理</li>
                    <li>• 資格・証明書管理</li>
                    <li>• スキル評価システム</li>
                    <li>• 育成計画・目標管理</li>
                    <li>• 面談記録管理</li>
                    <li>• ダッシュボード・通知機能</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
