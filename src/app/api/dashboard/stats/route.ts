import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 統計データ取得
export async function GET(request: NextRequest) {
  try {
    // 実習生総数
    const totalTrainees = await prisma.trainee.count({
      where: { isActive: true }
    });

    // 国籍別統計
    const nationalityStats = await prisma.trainee.groupBy({
      by: ['nationality'],
      where: { isActive: true },
      _count: { nationality: true },
      orderBy: { _count: { nationality: 'desc' } }
    });

    // 部署別統計
    const departmentStats = await prisma.trainee.groupBy({
      by: ['department'],
      where: { isActive: true },
      _count: { department: true },
      orderBy: { _count: { department: 'desc' } }
    });

    // 新規入国者数（過去3ヶ月）
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const newTrainees = await prisma.trainee.count({
      where: {
        isActive: true,
        entryDate: { gte: threeMonthsAgo }
      }
    });

    // 全体平均スキル習熟度（最新評価）
    const latestEvaluations = await prisma.evaluation.findMany({
      where: {
        trainee: { isActive: true },
        evaluationDate: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 過去90日以内
        }
      },
      select: { level: true },
      distinct: ['traineeId', 'skillId']
    });

    const averageSkillLevel = latestEvaluations.length > 0
      ? latestEvaluations.reduce((sum, eval) => sum + eval.level, 0) / latestEvaluations.length
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
