import { NextRequest, NextResponse } from 'next/server';

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

    // このエンドポイントではアプリ側のSupabase Auth UIを利用してください
    // ここではダミー応答のみ返します（ビルド互換性のため）
    return NextResponse.json({
      message: 'Supabase Auth を使用してください',
    }, { status: 405 });

  } catch (error) {
    console.error('ログインエラー:', error);
    return NextResponse.json(
      { error: 'ログイン処理でエラーが発生しました' },
      { status: 500 }
    );
  }
}
