import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 統計データ取得
export async function GET(request: NextRequest) {
  try {
    // 実習生総数
    const { count: totalTrainees = 0, error: totalErr } = await supabase
      .from('trainees')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    if (totalErr) throw totalErr;

    // 国籍別統計
    const { data: nationalityRows, error: natErr } = await supabase
      .from('trainees')
      .select('nationality')
      .eq('is_active', true);
    if (natErr) throw natErr;
    const nationalityCountMap = new Map<string, number>();
    (nationalityRows ?? []).forEach(row => {
      const key = (row as any).nationality as string;
      if (!key) return;
      nationalityCountMap.set(key, (nationalityCountMap.get(key) ?? 0) + 1);
    });
    const nationalityStats = Array.from(nationalityCountMap.entries())
      .map(([nationality, count]) => ({ nationality, _count: { nationality: count } }))
      .sort((a, b) => b._count.nationality - a._count.nationality);

    // 部署別統計
    const { data: departmentRows, error: deptErr } = await supabase
      .from('trainees')
      .select('department')
      .eq('is_active', true);
    if (deptErr) throw deptErr;
    const departmentCountMap = new Map<string, number>();
    (departmentRows ?? []).forEach(row => {
      const key = (row as any).department as string;
      if (!key) return;
      departmentCountMap.set(key, (departmentCountMap.get(key) ?? 0) + 1);
    });
    const departmentStats = Array.from(departmentCountMap.entries())
      .map(([department, count]) => ({ department, _count: { department: count } }))
      .sort((a, b) => b._count.department - a._count.department);

    // 新規入国者数（過去3ヶ月）
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const { count: newTrainees = 0, error: newErr } = await supabase
      .from('trainees')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('entry_date', threeMonthsAgo.toISOString());
    if (newErr) throw newErr;

    // 全体平均スキル習熟度（最新評価）
    // 最新評価（過去90日）から平均スキルレベルを算出（簡易版: 全件平均）
    const ninetyDaysAgoIso = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data: evaluationsRows, error: evalErr } = await supabase
      .from('evaluations')
      .select('level, evaluation_date')
      .gte('evaluation_date', ninetyDaysAgoIso);
    if (evalErr) throw evalErr;
    const levels = (evaluationsRows ?? []).map(r => (r as any).level as number).filter(v => typeof v === 'number');
    const averageSkillLevel = levels.length > 0
      ? levels.reduce((sum, curr) => sum + curr, 0) / levels.length
      : 0;

    return NextResponse.json({
      totalTrainees,
      newTrainees,
      averageSkillLevel: Math.round(averageSkillLevel * 100) / 100,
      nationalityStats: nationalityStats.map(stat => ({
        nationality: stat.nationality,
        count: stat._count.nationality
      })),
      departmentStats: departmentStats.map(stat => ({
        department: stat.department,
        count: stat._count.department
      }))
    });

  } catch (error) {
    console.error('統計データ取得エラー:', error);
    return NextResponse.json(
      { error: '統計データの取得に失敗しました' },
      { status: 500 }
    );
  }
}
