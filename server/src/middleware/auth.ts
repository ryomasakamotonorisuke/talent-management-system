import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// JWTトークンの型定義
interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// ExpressのRequest型を拡張
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// 認証ミドルウェア
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'アクセストークンが必要です' 
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRETが設定されていません');
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    // ユーザーの存在確認
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        error: '無効なトークンまたはユーザーが無効です' 
      });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        error: '無効なトークンです' 
      });
    }
    
    console.error('認証エラー:', error);
    return res.status(500).json({ 
      error: '認証処理でエラーが発生しました' 
    });
  }
};

// 権限チェックミドルウェア
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: '認証が必要です' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'この操作を実行する権限がありません' 
      });
    }

    next();
  };
};

// 管理権限チェック（ADMINのみ）
export const requireAdmin = requireRole([UserRole.ADMIN]);

// 管理・部署権限チェック（ADMIN + DEPARTMENT）
export const requireAdminOrDepartment = requireRole([UserRole.ADMIN, UserRole.DEPARTMENT]);

// 全権限チェック（ADMIN + DEPARTMENT + TRAINEE）
export const requireAnyRole = requireRole([UserRole.ADMIN, UserRole.DEPARTMENT, UserRole.TRAINEE]);

// 実習生本人または管理権限チェック
export const requireTraineeOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: '認証が必要です' 
    });
  }

  const { role, userId } = req.user;
  const traineeId = req.params.traineeId || req.body.traineeId;

  // 管理者は全アクセス可能
  if (role === UserRole.ADMIN) {
    return next();
  }

  // 実習生本人の場合、自分のデータのみアクセス可能
  if (role === UserRole.TRAINEE) {
    // 実習生のIDとユーザーIDが一致するかチェック
    // この部分は実装時に詳細を決める
    return next();
  }

  // 部署権限の場合、所属部署の実習生のみアクセス可能
  if (role === UserRole.DEPARTMENT) {
    // 部署チェックのロジックを実装
    return next();
  }

  return res.status(403).json({ 
    error: 'この操作を実行する権限がありません' 
  });
};

// エラーハンドリングミドルウェア
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('ミドルウェアエラー:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'バリデーションエラー',
      details: error.message
    });
  }

  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: '認証が必要です'
    });
  }

  res.status(500).json({
    error: 'サーバーエラーが発生しました'
  });
};

