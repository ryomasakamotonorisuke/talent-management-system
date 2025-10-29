import { Request, Response } from 'express';
import { authenticateToken, requireAdminOrDepartment } from '../middleware/auth';

const router = require('express').Router();

// 通知管理のルート（プレースホルダー）
router.get('/', authenticateToken, requireAdminOrDepartment, async (req: Request, res: Response) => {
  res.json({ message: '通知管理機能は実装中です' });
});

router.put('/:id/read', authenticateToken, requireAdminOrDepartment, async (req: Request, res: Response) => {
  res.json({ message: '通知既読機能は実装中です' });
});

module.exports = router;

