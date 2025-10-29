import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';

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

// ログイン
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // ユーザー検索
    const { data: users, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, password, name, role, department, is_active')
      .eq('email', email)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (userError || !users) {
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    const user = users as any;
    
    // パスワード検証
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが正しくありません' },
        { status: 401 }
      );
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

    // パスワードを除外してレスポンス（フィールド名を調整）
    const { password: _, is_active, ...rest } = user;
    const userWithoutPassword = {
      ...rest,
      isActive: is_active
    };

    return NextResponse.json({
      message: 'ログインに成功しました',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '入力データが無効です', details: error.errors },
        { status: 400 }
      );
    }

    console.error('ログインエラー:', error);
    return NextResponse.json(
      { error: 'ログイン処理でエラーが発生しました' },
      { status: 500 }
    );
  }
}

// ユーザー登録（管理者のみ）
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role, department } = registerSchema.parse(body);

    // メールアドレスの重複チェック
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に使用されています' },
        { status: 400 }
      );
    }

    // パスワードハッシュ化
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ユーザー作成
    const { data: userData, error: createError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        name,
        role,
        department,
        is_active: true
      })
      .select('id, email, name, role, department, is_active, created_at')
      .single();

    if (createError || !userData) {
      throw createError || new Error('ユーザー作成に失敗しました');
    }

    const user = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      department: userData.department,
      isActive: (userData as any).is_active,
      createdAt: (userData as any).created_at
    };

    return NextResponse.json({
      message: 'ユーザーが正常に作成されました',
      user
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '入力データが無効です', details: error.errors },
        { status: 400 }
      );
    }

    console.error('ユーザー登録エラー:', error);
    return NextResponse.json(
      { error: 'ユーザー登録処理でエラーが発生しました' },
      { status: 500 }
    );
  }
}
