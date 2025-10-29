import { Request, Response } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = require('express').Router();

// ユーザー管理のルート（プレースホルダー）
router.get('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  res.json({ message: 'ユーザー管理機能は実装中です' });
});

router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  res.json({ message: 'ユーザー登録機能は実装中です' });
});

router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  res.json({ message: 'ユーザー更新機能は実装中です' });
});

router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  res.json({ message: 'ユーザー削除機能は実装中です' });
});

module.exports = router;

