import { Request, Response } from 'express';
import { authenticateToken, requireAdminOrDepartment } from '../middleware/auth';

const router = require('express').Router();

// 面談記録管理のルート（プレースホルダー）
router.get('/', authenticateToken, requireAdminOrDepartment, async (req: Request, res: Response) => {
  res.json({ message: '面談記録管理機能は実装中です' });
});

router.post('/', authenticateToken, requireAdminOrDepartment, async (req: Request, res: Response) => {
  res.json({ message: '面談記録登録機能は実装中です' });
});

router.put('/:id', authenticateToken, requireAdminOrDepartment, async (req: Request, res: Response) => {
  res.json({ message: '面談記録更新機能は実装中です' });
});

module.exports = router;

