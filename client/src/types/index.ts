// ユーザー関連の型定義
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'DEPARTMENT' | 'TRAINEE';
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: 'ADMIN' | 'DEPARTMENT' | 'TRAINEE';
  department?: string;
}

// 実習生関連の型定義
export interface Trainee {
  id: string;
  traineeId: string;
  firstName: string;
  lastName: string;
  firstNameKana?: string;
  lastNameKana?: string;
  nationality: string;
  passportNumber: string;
  visaType: string;
  visaExpiryDate: string;
  entryDate: string;
  departureDate?: string;
  department: string;
  position?: string;
  photo?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TraineeWithDetails extends Trainee {
  healthRecords?: HealthRecord[];
  certificates?: Certificate[];
  evaluations?: Evaluation[];
  developmentPlans?: DevelopmentPlan[];
  interviews?: Interview[];
  ojtRecords?: OJTRecord[];
}

export interface CreateTraineeRequest {
  traineeId: string;
  firstName: string;
  lastName: string;
  firstNameKana?: string;
  lastNameKana?: string;
  nationality: string;
  passportNumber: string;
  visaType: string;
  visaExpiryDate: string;
  entryDate: string;
  departureDate?: string;
  department: string;
  position?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

// 健康記録関連の型定義
export interface HealthRecord {
  id: string;
  traineeId: string;
  recordDate: string;
  recordType: 'HEALTH_CHECK' | 'MEDICAL_CONSULTATION' | 'VACCINATION' | 'OTHER';
  description?: string;
  filePath?: string;
  doctorName?: string;
  clinicName?: string;
  createdAt: string;
  updatedAt: string;
}

// 資格・証明書関連の型定義
export interface Certificate {
  id: string;
  traineeId: string;
  name: string;
  issuingBody?: string;
  issueDate?: string;
  expiryDate?: string;
  filePath: string;
  encryptedData?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// スキル関連の型定義
export interface SkillMaster {
  id: string;
  name: string;
  category: string;
  description?: string;
  levels: Record<string, string>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Evaluation {
  id: string;
  traineeId: string;
  evaluatorId: string;
  skillId: string;
  level: number;
  comment?: string;
  evaluationDate: string;
  period: string;
  createdAt: string;
  updatedAt: string;
  trainee?: Trainee;
  skill?: SkillMaster;
  evaluator?: User;
}

// OJT記録関連の型定義
export interface OJTRecord {
  id: string;
  traineeId: string;
  trainerId?: string;
  date: string;
  content: string;
  duration?: number;
  progress?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 育成計画関連の型定義
export interface DevelopmentPlan {
  id: string;
  traineeId: string;
  creatorId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  goals: string[];
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  trainee?: Trainee;
  creator?: User;
}

// 面談記録関連の型定義
export interface Interview {
  id: string;
  traineeId: string;
  interviewerId: string;
  interviewDate: string;
  type: 'REGULAR' | 'PROGRESS' | 'CONCERN' | 'HEALTH' | 'EXIT';
  content: string;
  concerns?: string;
  healthStatus?: string;
  progress?: string;
  nextSteps?: string;
  createdAt: string;
  updatedAt: string;
  trainee?: Trainee;
  interviewer?: User;
}

// 通知関連の型定義
export interface Notification {
  id: string;
  userId?: string;
  traineeId?: string;
  type: 'VISA_EXPIRY' | 'CERTIFICATE_EXPIRY' | 'HEALTH_CHECK_DUE' | 'EVALUATION_DUE' | 'INTERVIEW_DUE' | 'SYSTEM';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
}

// ダッシュボード関連の型定義
export interface DashboardStats {
  totalTrainees: number;
  newTrainees: number;
  averageSkillLevel: number;
  nationalityStats: Array<{
    nationality: string;
    count: number;
  }>;
  departmentStats: Array<{
    department: string;
    count: number;
  }>;
}

export interface DashboardAlerts {
  visaExpiry: Array<{
    id: string;
    traineeId: string;
    firstName: string;
    lastName: string;
    department: string;
    visaExpiryDate: string;
  }>;
  certificateExpiry: Array<{
    id: string;
    name: string;
    expiryDate: string;
    trainee: {
      id: string;
      traineeId: string;
      firstName: string;
      lastName: string;
      department: string;
    };
  }>;
  healthCheckDue: Array<{
    id: string;
    traineeId: string;
    firstName: string;
    lastName: string;
    department: string;
    lastHealthCheck: string | null;
  }>;
  evaluationDue: Array<{
    traineeId: string;
    traineeName: string;
    department: string;
    skillName: string;
    period: string;
  }>;
  interviewDue: Array<{
    id: string;
    traineeId: string;
    firstName: string;
    lastName: string;
    department: string;
    lastInterview: string | null;
  }>;
}

export interface RecentActivities {
  evaluations: Array<Evaluation & {
    trainee: Pick<Trainee, 'traineeId' | 'firstName' | 'lastName'>;
    skill: Pick<SkillMaster, 'name'>;
    evaluator: Pick<User, 'name'>;
  }>;
  interviews: Array<Interview & {
    trainee: Pick<Trainee, 'traineeId' | 'firstName' | 'lastName'>;
    interviewer: Pick<User, 'name'>;
  }>;
  ojtRecords: Array<OJTRecord & {
    trainee: Pick<Trainee, 'traineeId' | 'firstName' | 'lastName'>;
  }>;
}

// API レスポンス関連の型定義
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

export interface PaginationResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 検索・フィルター関連の型定義
export interface TraineeSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  nationality?: string;
  department?: string;
  visaExpiry?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// フォーム関連の型定義
export interface FormError {
  field: string;
  message: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

