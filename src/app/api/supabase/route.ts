import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// ヘルスチェック
export async function GET() {
  return NextResponse.json({ 
    status: 'OK',
    message: 'Supabase API is running',
    timestamp: new Date().toISOString()
  });
}

// 実習生データの取得
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'get-trainees') {
      const { data, error } = await supabaseAdmin
        .from('trainees')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ trainees: data });
    }

    if (action === 'get-stats') {
      // 実習生総数
      const { count: totalTrainees } = await supabaseAdmin
        .from('trainees')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // 国籍別統計
      const { data: nationalityStats } = await supabaseAdmin
        .from('trainees')
        .select('nationality')
        .eq('is_active', true);

      const nationalityCount = nationalityStats?.reduce((acc: any, item: any) => {
        acc[item.nationality] = (acc[item.nationality] || 0) + 1;
        return acc;
      }, {}) || {};

      return NextResponse.json({
        totalTrainees: totalTrainees || 0,
        nationalityStats: Object.entries(nationalityCount).map(([nationality, count]) => ({
          nationality,
          count
        }))
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
