import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ヘルスチェック
export async function GET() {
  return NextResponse.json({ 
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
}
