import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// 環境変数の読み込み
dotenv.config();

// Prismaクライアントの初期化
export const prisma = new PrismaClient();

// Expressアプリケーションの作成
const app = express();
const PORT = process.env.PORT || 3001;

// セキュリティミドルウェア
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// レート制限
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // リクエスト制限
  message: 'リクエストが多すぎます。しばらく待ってから再試行してください。'
});
app.use(limiter);

// ボディパーサー
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静的ファイルの提供
app.use('/uploads', express.static('uploads'));

// ヘルスチェックエンドポイント
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// APIルート
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trainees', require('./routes/trainees'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/evaluations', require('./routes/evaluations'));
app.use('/api/development-plans', require('./routes/developmentPlans'));
app.use('/api/interviews', require('./routes/interviews'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/users', require('./routes/users'));

// 404ハンドラー
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'エンドポイントが見つかりません',
    path: req.originalUrl 
  });
});

// エラーハンドラー
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('エラー:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ 
      error: '無効なJSON形式です' 
    });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ 
      error: 'ファイルサイズが大きすぎます' 
    });
  }
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'サーバーエラーが発生しました' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// サーバーの起動
const startServer = async () => {
  try {
    // データベース接続の確認
    await prisma.$connect();
    console.log('✅ データベースに接続しました');
    
    app.listen(PORT, () => {
      console.log(`🚀 サーバーが起動しました: http://localhost:${PORT}`);
      console.log(`📊 環境: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ サーバーの起動に失敗しました:', error);
    process.exit(1);
  }
};

// グレースフルシャットダウン
process.on('SIGINT', async () => {
  console.log('\n🛑 サーバーをシャットダウンしています...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 サーバーをシャットダウンしています...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

