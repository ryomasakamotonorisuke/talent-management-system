# 🌐 Vercel + Supabase デプロイ完全ガイド

海外技能実習生タレントマネジメントシステムをVercelとSupabaseでデプロイする完全ガイドです。

## 📋 目次
1. [Supabaseプロジェクト作成](#supabaseプロジェクト作成)
2. [ローカル開発環境のセットアップ](#ローカル開発環境のセットアップ)
3. [データベーススキーマの適用](#データベーススキーマの適用)
4. [シードデータの投入](#シードデータの投入)
5. [Vercelデプロイ](#vercelデプロイ)
6. [本番環境の初期化](#本番環境の初期化)
7. [トラブルシューティング](#トラブルシューティング)

---

## 1️⃣ Supabaseプロジェクト作成

### Step 1.1: Supabaseアカウントの作成

1. **Supabaseにアクセス**
   - ブラウザで https://supabase.com を開く

2. **アカウント作成**
   - 右上の「Start your project」ボタンをクリック
   - 「Continue with GitHub」を選択
   - GitHubアカウントでログイン
   - Supabaseの利用規約を確認して「Accept」をクリック

### Step 1.2: 新しい組織の作成（初回のみ）

1. **組織名の設定**
   - 「Create a new organization」をクリック
   - Organization name に `Personal Projects` または任意の名前を入力
   - 「Create organization」をクリック

### Step 1.3: プロジェクトの作成

1. **プロジェクト情報の入力**
   ```
   Name: talent-management-system
   Database Password: （強力なパスワードを設定）
   例: MyStr0ng!P@ssw0rd#2024
   ```
   ⚠️ **重要**: このパスワードは必ずメモしておいてください。後でVercelの環境変数で使用します。

2. **リージョンの選択**
   - Region ドロップダウンで `Northeast Asia (Tokyo)` を選択
   - （日本に最も近いリージョンなので高速です）

3. **プランの選択**
   - 「Free」プランを選択（無料で使用可能）
   - 月500MBのデータベース容量
   - 500MBのファイルストレージ

4. **プロジェクト作成**
   - 「Create new project」ボタンをクリック
   - プロジェクト作成完了まで約2分待機

### Step 1.4: 接続情報の取得

1. **Database設定画面を開く**
   - プロジェクト作成完了後、ダッシュボードが表示されます
   - 左メニューから「Settings」をクリック
   - 「Database」をクリック

2. **接続URLをコピー**
   - 「Connection string」セクションを探す
   - 「URI」タブをクリック
   - 接続URLが表示されます（例）:
     ```
     postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
     ```
   - このURL全体をコピー

3. **パスワード部分の置換**
   - コピーしたURLの `[YOUR-PASSWORD]` 部分を、Step 1.3で設定したデータベースパスワードに置き換えてください
   - 最終的な形式:
     ```
     postgresql://postgres.xxxxxxxxxxxxx:MyStr0ng!P@ssw0rd#2024@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
     ```
   - このURLを後で使用します

---

## 2️⃣ ローカル開発環境のセットアップ

### Step 2.1: 秘密鍵の生成

1. **ターミナル（PowerShell）を開く**
   - プロジェクトルートで実行

2. **JWT秘密鍵の生成**
   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   - 出力例: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2`
   - この値をメモしてください（約64文字）

3. **NextAuth秘密鍵の生成**
   ```powershell
   node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
   ```
   - 出力例: `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7`
   - この値をメモしてください（約32文字）

4. **暗号化キーの生成**
   ```powershell
   node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
   ```
   - 出力例: `9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j`
   - この値をメモしてください（約32文字）

### Step 2.2: .env.localファイルの作成

1. **ファイルの作成**
   - プロジェクトルートに `.env.local` ファイルを作成
   - `env.example` を参考に作成できます

2. **内容を記述**
   
   ```env
   # ========================================
   # データベース接続設定
   # ========================================
   # Step 1.4で取得した接続URLを貼り付け
   DATABASE_URL="postgresql://postgres.xxxxxxxxxxxxx:MyStr0ng!P@ssw0rd#2024@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"
   
   # ========================================
   # JWT認証設定
   # ========================================
   # Step 2.1で生成したJWT秘密鍵を貼り付け（64文字程度）
   JWT_SECRET="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
   
   # JWTトークンの有効期限
   JWT_EXPIRES_IN="7d"
   
   # ========================================
   # NextAuth設定
   # ========================================
   # 開発環境URL
   NEXTAUTH_URL="http://localhost:3000"
   
   # Step 2.1で生成したNextAuth秘密鍵を貼り付け（32文字程度）
   NEXTAUTH_SECRET="1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7"
   
   # ========================================
   # メール設定（オプション - 後で設定可能）
   # ========================================
   SMTP_HOST="smtp.sendgrid.net"
   SMTP_PORT=587
   SMTP_USER="apikey"
   SMTP_PASS="your-sendgrid-api-key"
   
   # ========================================
   # ファイルアップロード設定（オプション）
   # ========================================
   BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
   
   # ========================================
   # 暗号化設定
   # ========================================
   # Step 2.1で生成した暗号化キーを貼り付け（32文字程度）
   ENCRYPTION_KEY="9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j"
   
   # ========================================
   # アラート設定
   # ========================================
   VISA_EXPIRY_ALERT_DAYS=60
   CERTIFICATE_EXPIRY_ALERT_DAYS=30
   HEALTH_CHECK_ALERT_DAYS=90
   ```

3. **ファイルの保存**
   - `.env.local` を保存
   - ⚠️ **重要**: このファイルはGitにコミットしないでください（既に.gitignoreに追加済み）

### Step 2.3: 依存関係のインストール

1. **Node.jsモジュールのインストール**
   ```powershell
   npm install
   ```
   - インストール完了まで待機（約2-3分）

2. **インストールの確認**
   ```powershell
   npm list --depth=0
   ```
   - 主要パッケージが表示されればOK

---

## 3️⃣ データベーススキーマの適用

### Step 3.1: Prismaクライアントの生成

```powershell
npx prisma generate
```

**実行結果の確認**:
```
✔ Generated Prisma Client
```

### Step 3.2: データベーススキーマの適用

```powershell
npx prisma db push
```

**実行中の確認項目**:
1. Supabaseへの接続確認
2. テーブル作成の確認
3. エラーがないか確認

**成功時の出力例**:
```
✔ Your database is now in sync with your Prisma schema.

The following migration(s) have been applied:
...
```

### Step 3.3: Supabaseでの確認

1. **Supabaseダッシュボードを開く**
   - https://supabase.com/dashboard

2. **テーブルエディタで確認**
   - 左メニューの「Table Editor」をクリック
   - 以下のテーブルが作成されていることを確認：
     - users
     - trainees
     - health_records
     - certificates
     - skill_masters
     - evaluations
     - ojt_records
     - development_plans
     - interviews
     - notifications
     - system_settings

---

## 4️⃣ シードデータの投入

### Step 4.1: シードデータの実行

```powershell
npm run db:seed
```

**実行結果の確認**:
```
🌱 シードデータの作成を開始します...
✅ ユーザーを作成しました
✅ スキルマスターを作成しました
✅ 実習生サンプルデータを作成しました
✅ システム設定を作成しました
🎉 シードデータの作成が完了しました！

📋 作成されたデータ:
  - 管理者ユーザー: admin@talent-management.com (パスワード: admin123)
  - 部署ユーザー: dept@talent-management.com (パスワード: dept123)
  - スキルマスター: 5種類
  - 実習生サンプル: 3名
  - システム設定: 5項目
```

### Step 4.2: ローカル開発サーバーの起動

```powershell
npm run dev
```

**起動確認**:
- `http://localhost:3000` が自動的に開く
- またはブラウザで手動でアクセス

### Step 4.3: ログインのテスト

1. **ログインページにアクセス**
   - ブラウザで `http://localhost:3000` にアクセス
   - 「ログイン」ボタンをクリック
   - または直接 `http://localhost:3000/login` にアクセス

2. **管理者アカウントでログイン**
   ```
   メールアドレス: admin@talent-management.com
   パスワード: admin123
   ```

3. **ダッシュボードの確認**
   - ログイン成功後、ダッシュボードに遷移
   - 統計情報が表示されることを確認

---

## 5️⃣ Vercelデプロイ

### Step 5.1: GitHubリポジトリへのプッシュ確認

```powershell
git status
```

**確認内容**:
- すべての変更がコミットされていること
- リモートリポジトリが正しく設定されていること

### Step 5.2: Vercelアカウントの準備

1. **Vercelにアクセス**
   - ブラウザで https://vercel.com を開く

2. **アカウント作成**
   - 「Sign Up」をクリック
   - 「Continue with GitHub」を選択
   - GitHubアカウントでログイン
   - 権限の確認画面で「Authorize Vercel」をクリック

### Step 5.3: プロジェクトのインポート

1. **Vercelダッシュボード**
   - ログイン後、ダッシュボードが表示されます

2. **新規プロジェクトの作成**
   - 「Add New...」→「Project」をクリック

3. **リポジトリの選択**
   - 「Import Git Repository」セクションが表示される
   - `ryomasakamotonorisuke` のリポジトリ一覧から `talent-management-system` を選択
   - 「Import」ボタンをクリック

### Step 5.4: プロジェクト設定の確認

Vercelが自動的に設定を検出します：

```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: .next (自動検出)
Install Command: npm install
```

これらの設定が正しく表示されていることを確認

### Step 5.5: 環境変数の設定

1. **環境変数セクションの展開**
   - 「Environment Variables」セクションをクリック

2. **環境変数の追加**

   **DATABASE_URL**:
   ```
   Name: DATABASE_URL
   Value: （Supabaseからコピーした接続URL）
   ```
   
   **JWT_SECRET**:
   ```
   Name: JWT_SECRET
   Value: （ローカルで生成した64文字の秘密鍵）
   ```
   
   **NEXTAUTH_SECRET**:
   ```
   Name: NEXTAUTH_SECRET
   Value: （ローカルで生成した32文字の秘密鍵）
   ```
   
   **NEXTAUTH_URL**:
   ```
   Name: NEXTAUTH_URL
   Value: https://your-app.vercel.app
   ```
   ⚠️ 注意: このURLは後でデプロイ後に実際のURLに置き換える必要があります

3. **追加方法**
   - 各変数を入力後、「Add」ボタンをクリック
   - 全ての環境変数を追加

### Step 5.6: デプロイの実行

1. **デプロイ開始**
   - 右下の「Deploy」ボタンをクリック

2. **ビルドプロセスの確認**
   - 「Building」のステータスが表示される
   - ビルドログがリアルタイムで表示される
   - ビルド完了まで約3-5分

3. **ビルド成功の確認**
   - 「Success」メッセージが表示される
   - 「Visit」ボタンが表示される

### Step 5.7: デプロイ後の確認

1. **サイトへのアクセス**
   - 「Visit」ボタンをクリック
   - 新しいタブで本番サイトが開く
   - URLは `https://talent-management-system.vercel.app` のような形式

2. **初回アクセスの確認**
   - トップページが表示されることを確認
   - エラーが表示されないことを確認

---

## 6️⃣ 本番環境の初期化

### Step 6.1: 本番環境のデータベース初期化

Vercelデプロイ直後、データベースにはまだシードデータが入っていません。初期化が必要です。

#### 方法A: Vercel CLIを使用（推奨）

1. **Vercel CLIのインストール**
   ```powershell
   npm i -g vercel
   ```

2. **Vercelにログイン**
   ```powershell
   vercel login
   ```
   - ブラウザでログインが自動的に開きます

3. **環境変数の取得**
   ```powershell
   vercel env pull .env.production
   ```

4. **データベースの適用**
   ```powershell
   npx prisma db push --accept-data-loss
   ```

5. **シードデータの投入**
   ```powershell
   npx prisma db seed
   ```

#### 方法B: Supabase SQLエディタを使用

1. **Supabaseダッシュボードを開く**
   - https://supabase.com/dashboard

2. **SQL Editorを開く**
   - 左メニューの「SQL Editor」をクリック

3. **新しいクエリを作成**
   - 「New query」ボタンをクリック

4. **以下のSQLを実行**

```sql
-- 管理ユーザーの作成
INSERT INTO users (email, password, name, role, department, is_active)
VALUES (
  'admin@talent-management.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5K9QvRN/rGIdq',
  'システム管理者',
  'ADMIN',
  '人事部',
  true
);

-- 部署ユーザーの作成
INSERT INTO users (email, password, name, role, department, is_active)
VALUES (
  'dept@talent-management.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5K9QvRN/rGIdq',
  '現場担当者',
  'DEPARTMENT',
  '製造部',
  true
);
```

⚠️ **注意**: 上のパスワードハッシュは `admin123` と `dept123` のbcryptハッシュです

### Step 6.2: 本番サイトでのログインテスト

1. **ログインページにアクセス**
   - 本番サイトURL + `/login` にアクセス
   - 例: `https://talent-management-system.vercel.app/login`

2. **管理者アカウントでログイン**
   ```
   メールアドレス: admin@talent-management.com
   パスワード: admin123
   ```

3. **機能の確認**
   - ダッシュボードが表示されること
   - データが正しく表示されること
   - エラーが発生しないこと

---

## 7️⃣ トラブルシューティング

### 問題1: ビルドエラー

**症状**: Vercelでのビルドが失敗する

**解決方法**:
```powershell
# ローカルでビルドテスト
npm run build
```

**よくある原因**:
1. TypeScriptエラーがある
2. 依存関係が不足している
3. 環境変数が正しく設定されていない

### 問題2: データベース接続エラー

**症状**: 本番環境でデータベースに接続できない

**解決方法**:
1. Vercelの環境変数で `DATABASE_URL` が正しく設定されているか確認
2. Supabaseで接続パスワードが正しいか確認
3. `npx prisma generate` を再実行

### 問題3: 404エラー

**症状**: ページが見つからない

**解決方法**:
1. ルーティングが正しく設定されているか確認
2. `next.config.js` の設定を確認
3. Vercelのデプロイログを確認

### 問題4: 認証エラー

**症状**: ログインできない

**解決方法**:
1. `JWT_SECRET` と `NEXTAUTH_SECRET` が正しく設定されているか確認
2. 環境変数が本番環境にも反映されているか確認
3. ブラウザのキャッシュをクリア

### 問題5: データが表示されない

**症状**: ダッシュボードにデータが表示されない

**解決方法**:
1. シードデータが正しく投入されているか確認
2. SupabaseのTable Editorでデータを確認
3. APIエンドポイントが正しく動作しているか確認

---

## 🎉 完了！

これで、Vercel + Supabase での本番環境が完成しました！

### 📊 管理画面

- **Vercel**: https://vercel.com/dashboard
- **Supabase**: https://supabase.com/dashboard
- **GitHub**: https://github.com/ryomasakamotonorisuke/talent-management-system

### 🌐 アクセスURL

- **本番環境**: `https://your-app.vercel.app`
- **ログインページ**: `https://your-app.vercel.app/login`
- **ダッシュボード**: `https://your-app.vercel.app/dashboard`

### 👥 デモアカウント

- **管理者**: `admin@talent-management.com` / `admin123`
- **部署担当者**: `dept@talent-management.com` / `dept123`

---

**次のステップ**:
- 実際の運用に合わせてカスタマイズ
- 追加機能の実装
- パフォーマンスの最適化