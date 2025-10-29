import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Download, 
  Search, 
  Filter, 
  Edit, 
  Eye,
  Calendar,
  Flag,
  Building
} from 'lucide-react';
import { traineeApi } from '../services/api';
import { Trainee, TraineeSearchParams } from '../types';

const TraineeListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState<TraineeSearchParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const { data, isLoading, error } = useQuery(
    ['trainees', searchParams],
    () => traineeApi.getTrainees(searchParams),
    {
      keepPreviousData: true,
    }
  );

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get('search') as string;
    setSearchParams(prev => ({ ...prev, search, page: 1 }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setSearchParams(prev => ({ 
      ...prev, 
      [key]: value || undefined, 
      page: 1 
    }));
  };

  const handleSort = (sortBy: string) => {
    setSearchParams(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
  };

  const handleExportCsv = async () => {
    try {
      const blob = await traineeApi.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trainees_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('CSV出力エラー:', error);
    }
  };

  const getVisaStatus = (expiryDate: string) => {
    const days = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { status: 'expired', color: 'text-red-600', bg: 'bg-red-100' };
    if (days <= 30) return { status: 'urgent', color: 'text-red-600', bg: 'bg-red-100' };
    if (days <= 60) return { status: 'warning', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'ok', color: 'text-green-600', bg: 'bg-green-100' };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">データの読み込みに失敗しました</p>
      </div>
    );
  }

  const trainees = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">実習生台帳</h1>
          <p className="mt-1 text-sm text-gray-600">
            実習生の基本情報とスキル評価を管理します
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportCsv}
            className="btn-secondary flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            CSV出力
          </button>
          <button
            onClick={() => navigate('/trainees/new')}
            className="btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            新規登録
          </button>
        </div>
      </div>

      {/* 検索・フィルター */}
      <div className="card">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  name="search"
                  type="text"
                  placeholder="氏名・実習生IDで検索..."
                  className="input-field pl-10"
                  defaultValue={searchParams.search}
                />
              </div>
            </div>
            <div>
              <select
                value={searchParams.nationality || ''}
                onChange={(e) => handleFilterChange('nationality', e.target.value)}
                className="input-field"
              >
                <option value="">国籍を選択</option>
                <option value="ベトナム">ベトナム</option>
                <option value="中国">中国</option>
                <option value="フィリピン">フィリピン</option>
                <option value="インドネシア">インドネシア</option>
                <option value="タイ">タイ</option>
              </select>
            </div>
            <div>
              <select
                value={searchParams.department || ''}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="input-field"
              >
                <option value="">部署を選択</option>
                <option value="製造部">製造部</option>
                <option value="品質管理部">品質管理部</option>
                <option value="技術部">技術部</option>
                <option value="総務部">総務部</option>
              </select>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <button type="submit" className="btn-primary">
              検索
            </button>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={searchParams.visaExpiry || ''}
                onChange={(e) => handleFilterChange('visaExpiry', e.target.value)}
                className="input-field"
              >
                <option value="">在留期限フィルター</option>
                <option value="30">30日以内</option>
                <option value="60">60日以内</option>
                <option value="90">90日以内</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* 実習生一覧テーブル */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('traineeId')}
                >
                  実習生ID
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('firstName')}
                >
                  氏名
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('nationality')}
                >
                  <Flag className="h-4 w-4 inline mr-1" />
                  国籍
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('department')}
                >
                  <Building className="h-4 w-4 inline mr-1" />
                  配属部署
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('visaExpiryDate')}
                >
                  <Calendar className="h-4 w-4 inline mr-1" />
                  在留期限
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  スキル評価
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trainees.map((trainee) => {
                const visaStatus = getVisaStatus(trainee.visaExpiryDate);
                const latestEvaluation = trainee.evaluations?.[0];
                
                return (
                  <tr key={trainee.id} className="table-row-hover">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {trainee.traineeId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {trainee.lastName} {trainee.firstName}
                      </div>
                      {trainee.firstNameKana && trainee.lastNameKana && (
                        <div className="text-sm text-gray-500">
                          {trainee.lastNameKana} {trainee.firstNameKana}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trainee.nationality}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trainee.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${visaStatus.bg} ${visaStatus.color}`}>
                        {new Date(trainee.visaExpiryDate).toLocaleDateString('ja-JP')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {latestEvaluation ? (
                        <div className="flex items-center">
                          <span className="text-sm font-medium">
                            {latestEvaluation.skill?.name}: {latestEvaluation.level}/5
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">未評価</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/trainees/${trainee.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/trainees/${trainee.id}/edit`)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ページネーション */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                前へ
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                次へ
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span>
                  -
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>
                  件中
                  <span className="font-medium"> {pagination.total}</span>
                  件を表示
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    前へ
                  </button>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pagination.page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    次へ
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TraineeListPage;

