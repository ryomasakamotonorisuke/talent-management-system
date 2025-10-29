import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = require('express').Router();

// バリデーションスキーマ
const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください')
});

const registerSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上で入力してください'),
  name: z.string().min(1, '名前を入力してください'),
  role: z.enum(['ADMIN', 'DEPARTMENT', 'TRAINEE']),
  department: z.string().optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, '現在のパスワードを入力してください'),
  newPassword: z.string().min(6, '新しいパスワードは6文字以上で入力してください')
});

// ログイン
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // ユーザー検索
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        department: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'メールアドレスまたはパスワードが正しくありません'
      });
    }

    // パスワード検証
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'メールアドレスまたはパスワードが正しくありません'
      });
    }

    // JWTトークン生成
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRETが設定されていません');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // パスワードを除外してレスポンス
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'ログインに成功しました',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: '入力データが無効です',
        details: error.errors
      });
    }

    console.error('ログインエラー:', error);
    res.status(500).json({
      error: 'ログイン処理でエラーが発生しました'
    });
  }
});

// ユーザー登録（管理者のみ）
router.post('/register', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, department } = registerSchema.parse(req.body);

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'このメールアドレスは既に使用されています'
      });
    }

    // パスワードハッシュ化
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        department
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        isActive: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'ユーザーが正常に作成されました',
      user
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: '入力データが無効です',
        details: error.errors
      });
    }

    console.error('ユーザー登録エラー:', error);
    res.status(500).json({
      error: 'ユーザー登録処理でエラーが発生しました'
    });
  }
});

// パスワード変更
router.put('/change-password', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    if (!req.user) {
      return res.status(401).json({
        error: '認証が必要です'
      });
    }

    // 現在のユーザー情報取得
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { password: true }
    });

    if (!user) {
      return res.status(404).json({
        error: 'ユーザーが見つかりません'
      });
    }

    // 現在のパスワード検証
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        error: '現在のパスワードが正しくありません'
      });
    }

    // 新しいパスワードハッシュ化
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // パスワード更新
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { password: hashedNewPassword }
    });

    res.json({
      message: 'パスワードが正常に変更されました'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: '入力データが無効です',
        details: error.errors
      });
    }

    console.error('パスワード変更エラー:', error);
    res.status(500).json({
      error: 'パスワード変更処理でエラーが発生しました'
    });
  }
});

// プロフィール取得
router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: '認証が必要です'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'ユーザーが見つかりません'
      });
    }

    res.json({ user });

  } catch (error) {
    console.error('プロフィール取得エラー:', error);
    res.status(500).json({
      error: 'プロフィール取得処理でエラーが発生しました'
    });
  }
});

// プロフィール更新
router.put('/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: '認証が必要です'
      });
    }

    const { name, department } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        name: name || undefined,
        department: department || undefined
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        isActive: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'プロフィールが正常に更新されました',
      user
    });

  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    res.status(500).json({
      error: 'プロフィール更新処理でエラーが発生しました'
    });
  }
});

// ログアウト（トークン無効化は実装しない - ステートレスJWT）
router.post('/logout', authenticateToken, (req: Request, res: Response) => {
  res.json({
    message: 'ログアウトしました'
  });
});

module.exports = router;

