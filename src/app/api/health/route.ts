import { NextRequest, NextResponse } from 'next/server';

// ヘルスチェック
export async function GET() {
  return NextResponse.json({ 
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
}
