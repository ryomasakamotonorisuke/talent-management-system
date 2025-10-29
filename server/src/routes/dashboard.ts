import { Request, Response } from 'express';
import { prisma } from '../index';
import { authenticateToken, requireAdminOrDepartment } from '../middleware/auth';

const router = require('express').Router();

// ダッシュボード統計データ取得
router.get('/stats', authenticateToken, requireAdminOrDepartment, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: '認証が必要です' });
    }

    // 基本条件（部署権限の場合は所属部署のみ）
    const baseWhere: any = { isActive: true };
    if (user.role === 'DEPARTMENT' && user.department) {
      baseWhere.department = user.department;
    }

    // 実習生総数
    const totalTrainees = await prisma.trainee.count({ where: baseWhere });

    // 国籍別統計
    const nationalityStats = await prisma.trainee.groupBy({
      by: ['nationality'],
      where: baseWhere,
      _count: { nationality: true },
      orderBy: { _count: { nationality: 'desc' } }
    });

    // 部署別統計
    const departmentStats = await prisma.trainee.groupBy({
      by: ['department'],
      where: baseWhere,
      _count: { department: true },
      orderBy: { _count: { department: 'desc' } }
    });

    // 新規入国者数（過去3ヶ月）
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const newTrainees = await prisma.trainee.count({
      where: {
        ...baseWhere,
        entryDate: { gte: threeMonthsAgo }
      }
    });

    // 全体平均スキル習熟度（最新評価）
    const latestEvaluations = await prisma.evaluation.findMany({
      where: {
        trainee: baseWhere,
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

    res.json({
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
    res.status(500).json({
      error: '統計データの取得に失敗しました'
    });
  }
});

// アラート一覧取得
router.get('/alerts', authenticateToken, requireAdminOrDepartment, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: '認証が必要です' });
    }

    // 基本条件
    const baseWhere: any = { isActive: true };
    if (user.role === 'DEPARTMENT' && user.department) {
      baseWhere.department = user.department;
    }

    const alerts = {
      visaExpiry: [],
      certificateExpiry: [],
      healthCheckDue: [],
      evaluationDue: [],
      interviewDue: []
    };

    // 在留期限アラート（60日以内）
    const visaExpiryDate = new Date();
    visaExpiryDate.setDate(visaExpiryDate.getDate() + 60);

    alerts.visaExpiry = await prisma.trainee.findMany({
      where: {
        ...baseWhere,
        visaExpiryDate: { lte: visaExpiryDate }
      },
      select: {
        id: true,
        traineeId: true,
        firstName: true,
        lastName: true,
        department: true,
        visaExpiryDate: true
      },
      orderBy: { visaExpiryDate: 'asc' }
    });

    // 資格期限アラート（30日以内）
    const certificateExpiryDate = new Date();
    certificateExpiryDate.setDate(certificateExpiryDate.getDate() + 30);

    const expiringCertificates = await prisma.certificate.findMany({
      where: {
        isActive: true,
        expiryDate: { lte: certificateExpiryDate },
        trainee: baseWhere
      },
      include: {
        trainee: {
          select: {
            id: true,
            traineeId: true,
            firstName: true,
            lastName: true,
            department: true
          }
        }
      },
      orderBy: { expiryDate: 'asc' }
    });

    alerts.certificateExpiry = expiringCertificates.map(cert => ({
      id: cert.id,
      name: cert.name,
      expiryDate: cert.expiryDate,
      trainee: cert.trainee
    }));

    // 健康診断期限アラート（90日以内）
    const healthCheckDate = new Date();
    healthCheckDate.setDate(healthCheckDate.getDate() + 90);

    // 最新の健康診断記録を取得
    const traineesWithHealthRecords = await prisma.trainee.findMany({
      where: baseWhere,
      include: {
        healthRecords: {
          where: { recordType: 'HEALTH_CHECK' },
          orderBy: { recordDate: 'desc' },
          take: 1
        }
      }
    });

    alerts.healthCheckDue = traineesWithHealthRecords
      .filter(trainee => {
        if (trainee.healthRecords.length === 0) return true;
        const lastHealthCheck = trainee.healthRecords[0].recordDate;
        const nextDueDate = new Date(lastHealthCheck);
        nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
        return nextDueDate <= healthCheckDate;
      })
      .map(trainee => ({
        id: trainee.id,
        traineeId: trainee.traineeId,
        firstName: trainee.firstName,
        lastName: trainee.lastName,
        department: trainee.department,
        lastHealthCheck: trainee.healthRecords[0]?.recordDate || null
      }));

    // 評価期限アラート（評価期間内の未入力）
    const currentDate = new Date();
    const currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1;
    const currentYear = currentDate.getFullYear();
    const period = `${currentYear}-Q${currentQuarter}`;

    // スキルマスターと実習生の組み合わせで評価が必要なものを取得
    const skillMasters = await prisma.skillMaster.findMany({
      where: { isActive: true }
    });

    const trainees = await prisma.trainee.findMany({
      where: baseWhere,
      select: { id: true, traineeId: true, firstName: true, lastName: true, department: true }
    });

    const evaluationAlerts = [];
    for (const trainee of trainees) {
      for (const skill of skillMasters) {
        const existingEvaluation = await prisma.evaluation.findFirst({
          where: {
            traineeId: trainee.id,
            skillId: skill.id,
            period: period
          }
        });

        if (!existingEvaluation) {
          evaluationAlerts.push({
            traineeId: trainee.traineeId,
            traineeName: `${trainee.lastName} ${trainee.firstName}`,
            department: trainee.department,
            skillName: skill.name,
            period: period
          });
        }
      }
    }

    alerts.evaluationDue = evaluationAlerts;

    // 面談期限アラート（3ヶ月以内に面談未実施）
    const interviewDate = new Date();
    interviewDate.setMonth(interviewDate.getMonth() - 3);

    const traineesWithoutRecentInterview = await prisma.trainee.findMany({
      where: {
        ...baseWhere,
        interviews: {
          none: {
            interviewDate: { gte: interviewDate }
          }
        }
      },
      select: {
        id: true,
        traineeId: true,
        firstName: true,
        lastName: true,
        department: true,
        interviews: {
          orderBy: { interviewDate: 'desc' },
          take: 1,
          select: { interviewDate: true }
        }
      }
    });

    alerts.interviewDue = traineesWithoutRecentInterview.map(trainee => ({
      id: trainee.id,
      traineeId: trainee.traineeId,
      firstName: trainee.firstName,
      lastName: trainee.lastName,
      department: trainee.department,
      lastInterview: trainee.interviews[0]?.interviewDate || null
    }));

    res.json({ alerts });

  } catch (error) {
    console.error('アラート取得エラー:', error);
    res.status(500).json({
      error: 'アラートの取得に失敗しました'
    });
  }
});

// 最近の活動取得
router.get('/recent-activities', authenticateToken, requireAdminOrDepartment, async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: '認証が必要です' });
    }

    // 基本条件
    const baseWhere: any = { isActive: true };
    if (user.role === 'DEPARTMENT' && user.department) {
      baseWhere.department = user.department;
    }

    const limit = parseInt(req.query.limit as string) || 10;

    // 最近の評価
    const recentEvaluations = await prisma.evaluation.findMany({
      where: {
        trainee: baseWhere
      },
      include: {
        trainee: {
          select: { traineeId: true, firstName: true, lastName: true }
        },
        skill: {
          select: { name: true }
        },
        evaluator: {
          select: { name: true }
        }
      },
      orderBy: { evaluationDate: 'desc' },
      take: limit
    });

    // 最近の面談
    const recentInterviews = await prisma.interview.findMany({
      where: {
        trainee: baseWhere
      },
      include: {
        trainee: {
          select: { traineeId: true, firstName: true, lastName: true }
        },
        interviewer: {
          select: { name: true }
        }
      },
      orderBy: { interviewDate: 'desc' },
      take: limit
    });

    // 最近のOJT記録
    const recentOJTRecords = await prisma.oJTRecord.findMany({
      where: {
        trainee: baseWhere
      },
      include: {
        trainee: {
          select: { traineeId: true, firstName: true, lastName: true }
        }
      },
      orderBy: { date: 'desc' },
      take: limit
    });

    res.json({
      evaluations: recentEvaluations,
      interviews: recentInterviews,
      ojtRecords: recentOJTRecords
    });

  } catch (error) {
    console.error('最近の活動取得エラー:', error);
    res.status(500).json({
      error: '最近の活動の取得に失敗しました'
    });
  }
});

module.exports = router;

