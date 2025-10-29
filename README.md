# 海外技能実習生タレントマネジメントシステム

## 🎯 システム概要

海外技能実習生の情報、資格、スキル、育成計画、評価履歴を一元管理し、管理部署と勤務部署で安全かつ効率的に利用できるクラウドベースのタレントマネジメントシステムです。

## 🚀 Vercelデプロイ対応

このシステムは **Vercel** での個人公開を前提として設計されています。

### 技術スタック
- **Next.js 14** + **TypeScript** - フルスタックフレームワーク
- **Prisma** + **PostgreSQL** - 型安全なORMとデータベース
- **Tailwind CSS** - モダンなUIデザイン
- **JWT認証** - セキュアな認証システム
- **Vercel Blob** - ファイルストレージ
- **SendGrid** - メール送信

## 🛠️ ローカル開発環境のセットアップ

### 1. 前提条件
- Node.js 18以上
- PostgreSQL データベース（ローカルまたはクラウド）

### 2. リポジトリのクローン
```bash
git clone <repository-url>
cd talent-management-system
```

### 3. 依存関係のインストール
```bash
npm install
```

### 4. 環境変数の設定
```bash
# .env.local ファイルを作成
cp env.example .env.local
```

`.env.local` ファイルを編集して、以下の値を設定してください：

```env
# データベース設定（PostgreSQL）
DATABASE_URL="postgresql://username:password@localhost:5432/talent_management"

# JWT設定
JWT_SECRET="your-super-secret-jwt-key-here-minimum-32-characters"
JWT_EXPIRES_IN="7d"

# Next.js設定
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key"

# メール設定（SendGrid推奨）
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"

# ファイルアップロード設定（Vercel Blob）
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"

# 暗号化設定
ENCRYPTION_KEY="your-32-character-encryption-key"
```

### 5. データベースのセットアップ
```bash
# Prismaクライアントの生成
npx prisma generate

# データベースマイグレーション
npx prisma db push

# シードデータの投入
npm run db:seed
```

### 6. 開発サーバーの起動
```bash
npm run dev
```

http://localhost:3000 でアクセスできます。

## 🌐 Vercelデプロイ手順

### 1. Vercelアカウントの準備
- [Vercel](https://vercel.com) でアカウントを作成
- GitHubリポジトリと連携

### 2. データベースの設定
以下のいずれかを選択：

#### Option A: Supabase（推奨）
1. [Supabase](https://supabase.com) でプロジェクト作成
2. PostgreSQLデータベースのURLを取得
3. Vercelの環境変数に `DATABASE_URL` を設定

#### Option B: PlanetScale
1. [PlanetScale](https://planetscale.com) でデータベース作成
2. 接続URLを取得
3. Vercelの環境変数に `DATABASE_URL` を設定

### 3. Vercel環境変数の設定
Vercelダッシュボードで以下の環境変数を設定：

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-super-secret-jwt-key
NEXTAUTH_SECRET=your-nextauth-secret
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
ENCRYPTION_KEY=your-32-character-key
```

### 4. デプロイ
```bash
# Vercel CLIでデプロイ
npx vercel

# または GitHubにプッシュして自動デプロイ
git push origin main
```

### 5. データベースの初期化
デプロイ後、Vercelの関数でシードデータを実行：

```bash
# Vercel CLIでシード実行
npx vercel env pull .env.local
npx prisma db push
npx prisma db seed
```

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
2. **資格・証明書管理**
3. **スキル・評価管理**
4. **育成計画・目標管理**
5. **通知機能**

## 🔧 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# リント
npm run lint

# データベース操作
npm run db:push    # スキーマをDBに反映
npm run db:seed    # シードデータ投入
npm run db:studio  # Prisma Studio起動
```

## 🔒 セキュリティ機能

- **認証**: JWT トークンベース認証
- **認可**: ロールベースアクセス制御（RBAC）
- **暗号化**: パスワードハッシュ化（bcrypt）
- **バリデーション**: 入力データ検証（Zod）
- **環境変数**: 機密情報の安全な管理

## 📈 パフォーマンス最適化

- **Next.js 14**: App Router使用
- **Prisma**: 効率的なデータベースクエリ
- **Vercel Edge**: グローバルCDN
- **画像最適化**: Next.js Image最適化
- **コード分割**: 自動的なコード分割

## 🌐 多言語対応

- **日本語**: メイン言語
- **ベトナム語**: 実習生向け画面（予定）
- **中国語**: 実習生向け画面（予定）

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

**海外技能実習生タレントマネジメントシステム** - Vercelで簡単デプロイ、実習生の習熟度向上と法令遵守を強力にサポートします。