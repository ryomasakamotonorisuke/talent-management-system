import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ログインページ用のAPI
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'メールアドレスとパスワードを入力してください' },
        { status: 400 }
      );
    }

    // ユーザー検索
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        isActive: true,
      }
    });

    // 認証が成功した場合の処理
    if (user) {
      return NextResponse.json({
        message: 'ログイン成功',
        user
      });
    }

    return NextResponse.json(
      { error: 'メールアドレスまたはパスワードが正しくありません' },
      { status: 401 }
    );

  } catch (error) {
    console.error('ログインエラー:', error);
    return NextResponse.json(
      { error: 'ログイン処理でエラーが発生しました' },
      { status: 500 }
    );
  }
}
