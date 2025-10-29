import axios, { AxiosInstance, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  User, 
  Trainee, 
  TraineeWithDetails, 
  CreateTraineeRequest,
  DashboardStats,
  DashboardAlerts,
  RecentActivities,
  ApiResponse,
  PaginationResponse,
  TraineeSearchParams
} from '../types';

// API クライアントの設定
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（認証トークンの自動付与）
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（エラーハンドリング）
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // 認証エラーの場合、ローカルストレージをクリアしてログインページへリダイレクト
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status >= 500) {
      toast.error('サーバーエラーが発生しました');
    } else if (error.response?.data?.error) {
      toast.error(error.response.data.error);
    } else {
      toast.error('予期しないエラーが発生しました');
    }
    return Promise.reject(error);
  }
);

// 認証関連のAPI
export const authApi = {
  // ログイン
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  // ユーザー登録（管理者のみ）
  register: async (userData: RegisterRequest): Promise<ApiResponse<User>> => {
    const response = await apiClient.post<ApiResponse<User>>('/auth/register', userData);
    return response.data;
  },

  // パスワード変更
  changePassword: async (passwordData: { currentPassword: string; newPassword: string }): Promise<ApiResponse> => {
    const response = await apiClient.put<ApiResponse>('/auth/change-password', passwordData);
    return response.data;
  },

  // プロフィール取得
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
    return response.data;
  },

  // プロフィール更新
  updateProfile: async (profileData: { name?: string; department?: string }): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>('/auth/profile', profileData);
    return response.data;
  },

  // ログアウト
  logout: async (): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/logout');
    return response.data;
  },
};

// 実習生関連のAPI
export const traineeApi = {
  // 実習生一覧取得
  getTrainees: async (params?: TraineeSearchParams): Promise<PaginationResponse<Trainee>> => {
    const response = await apiClient.get<PaginationResponse<Trainee>>('/trainees', { params });
    return response.data;
  },

  // 実習生詳細取得
  getTrainee: async (id: string): Promise<ApiResponse<TraineeWithDetails>> => {
    const response = await apiClient.get<ApiResponse<TraineeWithDetails>>(`/trainees/${id}`);
    return response.data;
  },

  // 実習生新規登録
  createTrainee: async (traineeData: CreateTraineeRequest): Promise<ApiResponse<Trainee>> => {
    const response = await apiClient.post<ApiResponse<Trainee>>('/trainees', traineeData);
    return response.data;
  },

  // 実習生情報更新
  updateTrainee: async (id: string, traineeData: Partial<CreateTraineeRequest>): Promise<ApiResponse<Trainee>> => {
    const response = await apiClient.put<ApiResponse<Trainee>>(`/trainees/${id}`, traineeData);
    return response.data;
  },

  // 実習生削除（論理削除）
  deleteTrainee: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/trainees/${id}`);
    return response.data;
  },

  // CSV出力
  exportCsv: async (): Promise<Blob> => {
    const response = await apiClient.get('/trainees/export/csv', {
      responseType: 'blob',
    });
    return response.data;
  },
};

// ダッシュボード関連のAPI
export const dashboardApi = {
  // 統計データ取得
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/dashboard/stats');
    return response.data;
  },

  // アラート一覧取得
  getAlerts: async (): Promise<ApiResponse<DashboardAlerts>> => {
    const response = await apiClient.get<ApiResponse<DashboardAlerts>>('/dashboard/alerts');
    return response.data;
  },

  // 最近の活動取得
  getRecentActivities: async (limit?: number): Promise<ApiResponse<RecentActivities>> => {
    const response = await apiClient.get<ApiResponse<RecentActivities>>('/dashboard/recent-activities', {
      params: { limit }
    });
    return response.data;
  },
};

// 資格・証明書関連のAPI（プレースホルダー）
export const certificateApi = {
  getCertificates: async (): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>('/certificates');
    return response.data;
  },

  createCertificate: async (data: any): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/certificates', data);
    return response.data;
  },

  updateCertificate: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await apiClient.put<ApiResponse>(`/certificates/${id}`, data);
    return response.data;
  },

  deleteCertificate: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/certificates/${id}`);
    return response.data;
  },
};

// スキル評価関連のAPI（プレースホルダー）
export const evaluationApi = {
  getEvaluations: async (): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>('/evaluations');
    return response.data;
  },

  createEvaluation: async (data: any): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/evaluations', data);
    return response.data;
  },

  updateEvaluation: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await apiClient.put<ApiResponse>(`/evaluations/${id}`, data);
    return response.data;
  },
};

// 育成計画関連のAPI（プレースホルダー）
export const developmentPlanApi = {
  getDevelopmentPlans: async (): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>('/development-plans');
    return response.data;
  },

  createDevelopmentPlan: async (data: any): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/development-plans', data);
    return response.data;
  },

  updateDevelopmentPlan: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await apiClient.put<ApiResponse>(`/development-plans/${id}`, data);
    return response.data;
  },
};

// 面談記録関連のAPI（プレースホルダー）
export const interviewApi = {
  getInterviews: async (): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>('/interviews');
    return response.data;
  },

  createInterview: async (data: any): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/interviews', data);
    return response.data;
  },

  updateInterview: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await apiClient.put<ApiResponse>(`/interviews/${id}`, data);
    return response.data;
  },
};

// 通知関連のAPI（プレースホルダー）
export const notificationApi = {
  getNotifications: async (): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>('/notifications');
    return response.data;
  },

  markAsRead: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.put<ApiResponse>(`/notifications/${id}/read`);
    return response.data;
  },
};

// ユーザー管理関連のAPI（プレースホルダー）
export const userApi = {
  getUsers: async (): Promise<ApiResponse> => {
    const response = await apiClient.get<ApiResponse>('/users');
    return response.data;
  },

  createUser: async (data: any): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: any): Promise<ApiResponse> => {
    const response = await apiClient.put<ApiResponse>(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/users/${id}`);
    return response.data;
  },
};

export default apiClient;

