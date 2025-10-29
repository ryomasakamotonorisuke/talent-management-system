# 海外技能実習生タレントマネジメントシステム

## 🎯 システム概要

海外技能実習生の情報、資格、スキル、育成計画、評価履歴を一元管理し、管理部署と勤務部署で安全かつ効率的に利用できるクラウドベースのタレントマネジメントシステムです。

## 🚀 技術スタック

### フロントエンド
- **React 18** + **TypeScript** - モダンなUI開発
- **Vite** - 高速な開発サーバーとビルド
- **Tailwind CSS** - ユーティリティファーストのCSS
- **React Router** - クライアントサイドルーティング
- **React Query** - サーバー状態管理
- **React Hook Form** - フォーム管理
- **Lucide React** - アイコンライブラリ

### バックエンド
- **Node.js** + **Express** + **TypeScript** - RESTful API
- **PostgreSQL** - リレーショナルデータベース
- **Prisma** - 型安全なORM
- **JWT** - 認証トークン
- **bcryptjs** - パスワードハッシュ化
- **Zod** - スキーマバリデーション

### セキュリティ
- **Helmet** - セキュリティヘッダー
- **CORS** - クロスオリジンリクエスト制御
- **Rate Limiting** - レート制限
- **SSL/TLS** - 暗号化通信（本番環境）

## 📁 プロジェクト構造

```
talent-management-system/
├── client/                 # React フロントエンド
│   ├── src/
│   │   ├── components/     # 再利用可能なコンポーネント
│   │   ├── pages/          # ページコンポーネント
│   │   ├── contexts/       # React Context
│   │   ├── services/       # API サービス
│   │   ├── types/          # TypeScript 型定義
│   │   └── utils/          # ユーティリティ関数
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Node.js バックエンド
│   ├── src/
│   │   ├── controllers/    # コントローラー
│   │   ├── routes/         # API ルート
│   │   ├── middleware/     # ミドルウェア
│   │   ├── services/       # ビジネスロジック
│   │   └── utils/          # ユーティリティ関数
│   ├── prisma/             # データベーススキーマ
│   ├── package.json
│   └── tsconfig.json
├── database/               # データベース関連
│   ├── migrations/         # Prisma マイグレーション
│   └── seeds/              # シードデータ
└── docs/                   # ドキュメント
```

## 🛠️ セットアップ手順

### 1. 前提条件
- Node.js 18以上
- PostgreSQL 14以上
- npm または yarn

### 2. リポジトリのクローン
```bash
git clone <repository-url>
cd talent-management-system
```

### 3. 依存関係のインストール
```bash
# ルートディレクトリで
npm install

# バックエンド
cd server
npm install

# フロントエンド
cd ../client
npm install
```

### 4. 環境変数の設定
```bash
# server/.env ファイルを作成
cp server/env.example server/.env
```

`server/.env` ファイルを編集して、以下の値を設定してください：

```env
# データベース設定
DATABASE_URL="postgresql://username:password@localhost:5432/talent_management"

# JWT設定
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# サーバー設定
PORT=3001
NODE_ENV=development

# メール設定（通知機能用）
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# ファイルアップロード設定
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH="./uploads"

# AWS S3設定（証明書保存用）
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="ap-northeast-1"
AWS_S3_BUCKET="talent-management-certificates"

# 暗号化設定
ENCRYPTION_KEY="your-32-character-encryption-key"

# アラート設定
VISA_EXPIRY_ALERT_DAYS=60
CERTIFICATE_EXPIRY_ALERT_DAYS=30
HEALTH_CHECK_ALERT_DAYS=90
```

### 5. データベースのセットアップ
```bash
cd server

# データベースマイグレーション
npx prisma migrate dev

# シードデータの投入
npx prisma db seed
```

### 6. 開発サーバーの起動
```bash
# ルートディレクトリで
npm run dev
```

これで以下のURLでアクセスできます：
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:3001

## 👥 デモアカウント

システムには以下のデモアカウントが用意されています：

### 管理者アカウント
- **メール**: admin@talent-management.com
- **パスワード**: admin123
- **権限**: 全機能にアクセス可能

### 部署担当者アカウント
- **メール**: dept@talent-management.com
- **パスワード**: dept123
- **権限**: 所属部署の実習生データの閲覧・編集

## 🔧 開発コマンド

### バックエンド
```bash
cd server

# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# データベースマイグレーション
npm run migrate

# シードデータ投入
npm run seed

# Prisma Studio起動
npm run studio
```

### フロントエンド
```bash
cd client

# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# プレビュー
npm run preview

# リント
npm run lint
```

## 📊 主要機能

### ✅ 実装済み機能
1. **認証・認可システム**
   - JWT認証
   - 権限ベースのアクセス制御
   - ログイン・ログアウト

2. **ダッシュボード**
   - 統計データ表示
   - アラート表示
   - 最近の活動

3. **実習生台帳管理**
   - 実習生一覧表示
   - 検索・フィルター機能
   - CSV出力
   - ページネーション

4. **データベース設計**
   - 完全なPrismaスキーマ
   - リレーション設計
   - シードデータ

### 🚧 実装予定機能
1. **実習生詳細管理**
   - 詳細情報表示
   - 情報編集
   - 新規登録

2. **資格・証明書管理**
   - 証明書アップロード
   - 期限アラート
   - 暗号化保存

3. **スキル・評価管理**
   - 多段階評価
   - 習熟度進捗
   - OJT記録

4. **育成計画・目標管理**
   - 目標設定
   - 進捗トラッキング
   - 面談記録

5. **通知機能**
   - 自動通知
   - メール送信
   - アラート管理

## 🔒 セキュリティ機能

- **認証**: JWT トークンベース認証
- **認可**: ロールベースアクセス制御（RBAC）
- **暗号化**: パスワードハッシュ化（bcrypt）
- **バリデーション**: 入力データ検証（Zod）
- **レート制限**: API レート制限
- **セキュリティヘッダー**: Helmet.js
- **CORS**: クロスオリジンリクエスト制御

## 🌐 多言語対応

- **日本語**: メイン言語
- **ベトナム語**: 実習生向け画面（予定）
- **中国語**: 実習生向け画面（予定）

## 📈 パフォーマンス要件

- **レスポンスタイム**: 3秒以内
- **稼働率**: 99.9%以上
- **同時接続**: 100ユーザー以上
- **データ容量**: 10,000実習生以上

## 🚀 デプロイメント

### 本番環境での設定
1. 環境変数の本番設定
2. SSL/TLS証明書の設定
3. データベースの本番設定
4. ファイルストレージ（AWS S3）の設定
5. メール送信設定

### 推奨インフラ
- **アプリケーション**: AWS EC2 / Google Cloud Run
- **データベース**: AWS RDS PostgreSQL
- **ファイルストレージ**: AWS S3
- **CDN**: CloudFront
- **監視**: CloudWatch / DataDog

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成
3. 変更をコミット
4. プルリクエストを作成

## 📞 サポート

技術的な質問や問題がある場合は、GitHubのIssuesでお知らせください。

---

**海外技能実習生タレントマネジメントシステム** - 実習生の習熟度向上と法令遵守を強力にサポートします。

