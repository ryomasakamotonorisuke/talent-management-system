import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../index';
import { authenticateToken, requireAdminOrDepartment, requireTraineeOrAdmin } from '../middleware/auth';

const router = require('express').Router();

// バリデーションスキーマ
const createTraineeSchema = z.object({
  traineeId: z.string().min(1, '実習生IDを入力してください'),
  firstName: z.string().min(1, '名前を入力してください'),
  lastName: z.string().min(1, '姓を入力してください'),
  firstNameKana: z.string().optional(),
  lastNameKana: z.string().optional(),
  nationality: z.string().min(1, '国籍を入力してください'),
  passportNumber: z.string().min(1, 'パスポート番号を入力してください'),
  visaType: z.string().min(1, '在留資格を入力してください'),
  visaExpiryDate: z.string().transform(str => new Date(str)),
  entryDate: z.string().transform(str => new Date(str)),
  departureDate: z.string().transform(str => new Date(str)).optional(),
  department: z.string().min(1, '配属部署を入力してください'),
  position: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional()
});

const updateTraineeSchema = createTraineeSchema.partial().extend({
  traineeId: z.string().optional(),
  visaExpiryDate: z.string().transform(str => new Date(str)).optional(),
  entryDate: z.string().transform(str => new Date(str)).optional(),
  departureDate: z.string().transform(str => new Date(str)).optional()
});

// 実習生一覧取得
router.get('/', authenticateToken, requireAdminOrDepartment, async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      search,
      nationality,
      department,
      visaExpiry,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // 検索条件の構築
    const where: any = {
      isActive: true
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { traineeId: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (nationality) {
      where.nationality = nationality;
    }

    if (department) {
      where.department = department;
    }

    if (visaExpiry) {
      const days = parseInt(visaExpiry as string);
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      
      where.visaExpiryDate = {
        lte: targetDate
      };
    }

    // 部署権限の場合は所属部署のみ表示
    if (req.user?.role === 'DEPARTMENT' && req.user.department) {
      where.department = req.user.department;
    }

    // ソート条件
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    // データ取得
    const [trainees, total] = await Promise.all([
      prisma.trainee.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        select: {
          id: true,
          traineeId: true,
          firstName: true,
          lastName: true,
          nationality: true,
          department: true,
          visaExpiryDate: true,
          entryDate: true,
          isActive: true,
          createdAt: true,
          // 最新のスキル評価を取得
          evaluations: {
            take: 1,
            orderBy: { evaluationDate: 'desc' },
            select: {
              level: true,
              skill: {
                select: { name: true }
              }
            }
          }
        }
      }),
      prisma.trainee.count({ where })
    ]);

    res.json({
      trainees,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('実習生一覧取得エラー:', error);
    res.status(500).json({
      error: '実習生一覧の取得に失敗しました'
    });
  }
});

// 実習生詳細取得
router.get('/:id', authenticateToken, requireTraineeOrAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const trainee = await prisma.trainee.findUnique({
      where: { id },
      include: {
        healthRecords: {
          orderBy: { recordDate: 'desc' },
          take: 5
        },
        certificates: {
          where: { isActive: true },
          orderBy: { expiryDate: 'asc' }
        },
        evaluations: {
          orderBy: { evaluationDate: 'desc' },
          include: {
            skill: true,
            evaluator: {
              select: { name: true, role: true }
            }
          }
        },
        developmentPlans: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          include: {
            creator: {
              select: { name: true, role: true }
            }
          }
        },
        interviews: {
          orderBy: { interviewDate: 'desc' },
          take: 3,
          include: {
            interviewer: {
              select: { name: true, role: true }
            }
          }
        },
        ojtRecords: {
          orderBy: { date: 'desc' },
          take: 10
        }
      }
    });

    if (!trainee) {
      return res.status(404).json({
        error: '実習生が見つかりません'
      });
    }

    res.json({ trainee });

  } catch (error) {
    console.error('実習生詳細取得エラー:', error);
    res.status(500).json({
      error: '実習生詳細の取得に失敗しました'
    });
  }
});

// 実習生新規登録
router.post('/', authenticateToken, requireAdminOrDepartment, async (req: Request, res: Response) => {
  try {
    const data = createTraineeSchema.parse(req.body);

    // 実習生IDの重複チェック
    const existingTrainee = await prisma.trainee.findUnique({
      where: { traineeId: data.traineeId }
    });

    if (existingTrainee) {
      return res.status(400).json({
        error: 'この実習生IDは既に使用されています'
      });
    }

    const trainee = await prisma.trainee.create({
      data,
      select: {
        id: true,
        traineeId: true,
        firstName: true,
        lastName: true,
        nationality: true,
        department: true,
        visaExpiryDate: true,
        entryDate: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: '実習生が正常に登録されました',
      trainee
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: '入力データが無効です',
        details: error.errors
      });
    }

    console.error('実習生登録エラー:', error);
    res.status(500).json({
      error: '実習生登録処理でエラーが発生しました'
    });
  }
});

// 実習生情報更新
router.put('/:id', authenticateToken, requireAdminOrDepartment, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = updateTraineeSchema.parse(req.body);

    // 実習生の存在確認
    const existingTrainee = await prisma.trainee.findUnique({
      where: { id }
    });

    if (!existingTrainee) {
      return res.status(404).json({
        error: '実習生が見つかりません'
      });
    }

    // 実習生IDの重複チェック（変更時）
    if (data.traineeId && data.traineeId !== existingTrainee.traineeId) {
      const duplicateTrainee = await prisma.trainee.findUnique({
        where: { traineeId: data.traineeId }
      });

      if (duplicateTrainee) {
        return res.status(400).json({
          error: 'この実習生IDは既に使用されています'
        });
      }
    }

    const trainee = await prisma.trainee.update({
      where: { id },
      data,
      select: {
        id: true,
        traineeId: true,
        firstName: true,
        lastName: true,
        nationality: true,
        department: true,
        visaExpiryDate: true,
        entryDate: true,
        updatedAt: true
      }
    });

    res.json({
      message: '実習生情報が正常に更新されました',
      trainee
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: '入力データが無効です',
        details: error.errors
      });
    }

    console.error('実習生更新エラー:', error);
    res.status(500).json({
      error: '実習生更新処理でエラーが発生しました'
    });
  }
});

// 実習生削除（論理削除）
router.delete('/:id', authenticateToken, requireAdminOrDepartment, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const trainee = await prisma.trainee.findUnique({
      where: { id }
    });

    if (!trainee) {
      return res.status(404).json({
        error: '実習生が見つかりません'
      });
    }

    await prisma.trainee.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      message: '実習生が正常に削除されました'
    });

  } catch (error) {
    console.error('実習生削除エラー:', error);
    res.status(500).json({
      error: '実習生削除処理でエラーが発生しました'
    });
  }
});

// CSV出力
router.get('/export/csv', authenticateToken, requireAdminOrDepartment, async (req: Request, res: Response) => {
  try {
    const trainees = await prisma.trainee.findMany({
      where: { isActive: true },
      select: {
        traineeId: true,
        firstName: true,
        lastName: true,
        firstNameKana: true,
        lastNameKana: true,
        nationality: true,
        passportNumber: true,
        visaType: true,
        visaExpiryDate: true,
        entryDate: true,
        departureDate: true,
        department: true,
        position: true,
        phoneNumber: true,
        email: true,
        address: true,
        emergencyContact: true,
        emergencyPhone: true,
        createdAt: true
      }
    });

    // CSVヘッダー
    const headers = [
      '実習生ID', '名前', '姓', '名前（カナ）', '姓（カナ）', '国籍', 'パスポート番号',
      '在留資格', '在留期限', '入国日', '帰国日', '配属部署', '職位',
      '電話番号', 'メールアドレス', '住所', '緊急連絡先', '緊急連絡先電話', '登録日'
    ];

    // CSVデータ
    const csvData = trainees.map(trainee => [
      trainee.traineeId,
      trainee.firstName,
      trainee.lastName,
      trainee.firstNameKana || '',
      trainee.lastNameKana || '',
      trainee.nationality,
      trainee.passportNumber,
      trainee.visaType,
      trainee.visaExpiryDate.toISOString().split('T')[0],
      trainee.entryDate.toISOString().split('T')[0],
      trainee.departureDate?.toISOString().split('T')[0] || '',
      trainee.department,
      trainee.position || '',
      trainee.phoneNumber || '',
      trainee.email || '',
      trainee.address || '',
      trainee.emergencyContact || '',
      trainee.emergencyPhone || '',
      trainee.createdAt.toISOString().split('T')[0]
    ]);

    // CSV文字列生成
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=trainees.csv');
    res.send('\uFEFF' + csvContent); // BOMを追加してExcel対応

  } catch (error) {
    console.error('CSV出力エラー:', error);
    res.status(500).json({
      error: 'CSV出力処理でエラーが発生しました'
    });
  }
});

module.exports = router;

