import { Request, Response } from 'express';
import { authenticateToken, requireAdminOrDepartment } from '../middleware/auth';

const router = require('express').Router();

// スキル評価管理のルート（プレースホルダー）
router.get('/', authenticateToken, requireAdminOrDepartment, async (req: Request, res: Response) => {
  res.json({ message: 'スキル評価管理機能は実装中です' });
});

router.post('/', authenticateToken, requireAdminOrDepartment, async (req: Request, res: Response) => {
  res.json({ message: 'スキル評価登録機能は実装中です' });
});

router.put('/:id', authenticateToken, requireAdminOrDepartment, async (req: Request, res: Response) => {
  res.json({ message: 'スキル評価更新機能は実装中です' });
});

module.exports = router;

