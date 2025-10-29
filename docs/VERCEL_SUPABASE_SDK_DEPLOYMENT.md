# 🌐 Vercel + Supabase SDK デプロイ完全ガイド

海外技能実習生タレントマネジメントシステムをVercelとSupabase SDKでデプロイする完全ガイドです。

## 📋 目次
1. [Supabaseプロジェクト設定](#supabaseプロジェクト設定)
2. [Supabase API キーの取得](#supabase-api-キーの取得)
3. [ローカル開発環境のセットアップ](#ローカル開発環境のセットアップ)
4. [Supabaseテーブルの作成](#supabaseテーブルの作成)
5. [Vercelデプロイ](#vercelデプロイ)
6. [本番環境の初期化](#本番環境の初期化)
7. [トラブルシューティング](#トラブルシューティング)

---

## 1️⃣ Supabaseプロジェクト設定

### Step 1.1: Supabaseプロジェクトの確認

1. **Supabaseダッシュボードにアクセス**
   - https://drmptaaooecrtlqpphhv.supabase.co
   - プロジェクト `talent-management-system` を確認

2. **プロジェクト情報の確認**
   - プロジェクト名: `talent-management-system`
   - プロジェクトID: `drmptaaooecrtlqpphhv`
   - リージョン: `Northeast Asia (Tokyo)`

---

## 2️⃣ Supabase API キーの取得

### Step 2.1: Project Settings を開く

1. **左サイドバーで「Project Settings」（歯車アイコン）をクリック**
2. **「API」をクリック**

### Step 2.2: API キーをコピー

以下の情報をコピーしてください：

#### Project URL
```
https://drmptaaooecrtlqpphhv.supabase.co
```

#### Project API keys
- **anon public** キー（長い文字列）
- **service_role secret** キー（長い文字列）

⚠️ **重要**: `service_role` キーは秘密情報です。絶対に公開しないでください。

---

## 3️⃣ ローカル開発環境のセットアップ

### Step 3.1: 環境変数ファイルの作成

プロジェクトルートに `.env.local` ファイルを作成：

```env
# ========================================
# Supabase設定（必須）
# ========================================
NEXT_PUBLIC_SUPABASE_URL="https://drmptaaooecrtlqpphhv.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# ========================================
# Next.js設定
# ========================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-key-minimum-32-chars"

# ========================================
# 暗号化設定
# ========================================
ENCRYPTION_KEY="your-32-character-encryption-key"
```

### Step 3.2: 秘密鍵の生成

```powershell
# NextAuth秘密鍵の生成（32文字）
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# 暗号化キーの生成（32文字）
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### Step 3.3: 依存関係のインストール

```powershell
npm install
```

---

## 4️⃣ Supabaseテーブルの作成

### Step 4.1: SQL Editor でテーブル作成

1. **Supabaseダッシュボードの「SQL Editor」を開く**
2. **「New query」をクリック**
3. **以下のSQLを実行**

```sql
-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'DEPARTMENT',
  department TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 実習生テーブル
CREATE TABLE IF NOT EXISTS trainees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  first_name_kana TEXT,
  last_name_kana TEXT,
  nationality TEXT NOT NULL,
  passport_number TEXT NOT NULL,
  visa_type TEXT NOT NULL,
  visa_expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  entry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  departure_date TIMESTAMP WITH TIME ZONE,
  department TEXT NOT NULL,
  position TEXT,
  phone_number TEXT,
  email TEXT,
  address TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 健康記録テーブル
CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID REFERENCES trainees(id) ON DELETE CASCADE,
  record_date TIMESTAMP WITH TIME ZONE NOT NULL,
  record_type TEXT NOT NULL,
  description TEXT,
  file_path TEXT,
  doctor_name TEXT,
  clinic_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 資格・証明書テーブル
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID REFERENCES trainees(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuing_body TEXT,
  issue_date TIMESTAMP WITH TIME ZONE,
  expiry_date TIMESTAMP WITH TIME ZONE,
  file_path TEXT NOT NULL,
  encrypted_data TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- スキルマスターテーブル
CREATE TABLE IF NOT EXISTS skill_masters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  levels JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 評価テーブル
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID REFERENCES trainees(id) ON DELETE CASCADE,
  evaluator_id UUID REFERENCES users(id),
  skill_id UUID REFERENCES skill_masters(id),
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 5),
  comment TEXT,
  evaluation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  period TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(trainee_id, skill_id, period, evaluator_id)
);

-- OJT記録テーブル
CREATE TABLE IF NOT EXISTS ojt_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID REFERENCES trainees(id) ON DELETE CASCADE,
  trainer_id TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  content TEXT NOT NULL,
  duration INTEGER,
  progress TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 育成計画テーブル
CREATE TABLE IF NOT EXISTS development_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID REFERENCES trainees(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  goals JSONB NOT NULL,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 面談記録テーブル
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_id UUID REFERENCES trainees(id) ON DELETE CASCADE,
  interviewer_id UUID REFERENCES users(id),
  interview_date TIMESTAMP WITH TIME ZONE NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  concerns TEXT,
  health_status TEXT,
  progress TEXT,
  next_steps TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 通知テーブル
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  trainee_id UUID REFERENCES trainees(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'MEDIUM',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- システム設定テーブル
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Step 4.2: RLS（Row Level Security）の設定

```sql
-- RLSを有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainees ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_masters ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ojt_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE development_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- 基本的なポリシー（全ユーザーが読み取り可能）
CREATE POLICY "Allow read access for authenticated users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access for authenticated users" ON trainees
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access for authenticated users" ON health_records
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access for authenticated users" ON certificates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access for authenticated users" ON skill_masters
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access for authenticated users" ON evaluations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access for authenticated users" ON ojt_records
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access for authenticated users" ON development_plans
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access for authenticated users" ON interviews
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access for authenticated users" ON notifications
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access for authenticated users" ON system_settings
  FOR SELECT USING (auth.role() = 'authenticated');
```

### Step 4.3: シードデータの投入

```sql
-- スキルマスターの作成
INSERT INTO skill_masters (name, category, description, levels) VALUES
('日本語能力', '言語', '日本語の読み書き、会話能力', '{"1": "基本的な挨拶ができる", "2": "簡単な日常会話ができる", "3": "業務に関する会話ができる", "4": "複雑な業務内容を理解できる", "5": "ネイティブレベルでコミュニケーションができる"}'),
('機械操作', '技術', '製造機械の操作技術', '{"1": "基本的な操作ができる", "2": "標準的な作業ができる", "3": "複雑な操作ができる", "4": "機械の調整・メンテナンスができる", "5": "新しい機械の習得・指導ができる"}'),
('品質管理', '品質', '品質チェック・管理技術', '{"1": "基本的な品質チェックができる", "2": "標準的な品質基準を理解している", "3": "品質問題の識別ができる", "4": "品質改善提案ができる", "5": "品質管理システムの構築ができる"}'),
('安全作業', '安全', '安全作業の知識と実践', '{"1": "基本的な安全ルールを理解している", "2": "安全装備の正しい使用ができる", "3": "危険予知ができる", "4": "安全指導ができる", "5": "安全管理システムの構築ができる"}'),
('チームワーク', 'ソフトスキル', 'チームでの協働能力', '{"1": "指示に従って作業ができる", "2": "チームメンバーと協力できる", "3": "積極的にチームに貢献できる", "4": "チームのリーダーシップを発揮できる", "5": "チーム全体の能力向上に貢献できる"}');

-- 実習生サンプルデータ
INSERT INTO trainees (trainee_id, first_name, last_name, first_name_kana, last_name_kana, nationality, passport_number, visa_type, visa_expiry_date, entry_date, department, position, phone_number, email, address, emergency_contact, emergency_phone) VALUES
('T2024001', '太郎', 'グエン', 'タロウ', 'グエン', 'ベトナム', 'N1234567', '技能実習1号', '2025-12-31', '2024-01-15', '製造部', '技能実習生', '090-1234-5678', 'trainee1@example.com', '東京都渋谷区', 'グエン 花子', '090-9876-5432'),
('T2024002', '花子', 'チャン', 'ハナコ', 'チャン', 'ベトナム', 'N2345678', '技能実習2号', '2026-06-30', '2023-07-01', '製造部', '技能実習生', '090-2345-6789', 'trainee2@example.com', '東京都新宿区', 'チャン 太郎', '090-8765-4321'),
('T2024003', '明', 'リー', 'アキラ', 'リー', '中国', 'C3456789', '技能実習1号', '2025-03-15', '2024-03-01', '品質管理部', '技能実習生', '090-3456-7890', 'trainee3@example.com', '東京都品川区', 'リー 美香', '090-7654-3210');

-- システム設定
INSERT INTO system_settings (key, value, description) VALUES
('visa_expiry_alert_days', '60', '在留期限アラートの日数'),
('certificate_expiry_alert_days', '30', '資格期限アラートの日数'),
('health_check_alert_days', '90', '健康診断期限アラートの日数'),
('evaluation_period_months', '3', '評価期間（月）'),
('interview_period_months', '3', '面談期間（月）');
```

---

## 5️⃣ Vercelデプロイ

### Step 5.1: GitHubにプッシュ

```powershell
git add .
git commit -m "Supabase SDK integration complete"
git push origin master
```

### Step 5.2: Vercelでプロジェクト作成

1. **Vercelダッシュボードで「New Project」**
2. **リポジトリ `ryomasakamotonorisuke/talent-management-system` を選択**
3. **「Import」をクリック**

### Step 5.3: 環境変数の設定

Vercelダッシュボードの「Environment Variables」で以下を設定：

```
NEXT_PUBLIC_SUPABASE_URL=https://drmptaaooecrtlqpphhv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-key
ENCRYPTION_KEY=your-32-character-encryption-key
```

### Step 5.4: デプロイ実行

1. **「Deploy」ボタンをクリック**
2. **ビルド完了を待つ**
3. **「Visit」でアクセス**

---

## 6️⃣ 本番環境の初期化

### Step 6.1: ユーザーアカウントの作成

Supabaseダッシュボードの「Authentication」→「Users」で以下を作成：

#### 管理者アカウント
- Email: `admin@talent-management.com`
- Password: `admin123`
- User Metadata: `{"role": "ADMIN", "name": "システム管理者", "department": "人事部"}`

#### 部署担当者アカウント
- Email: `dept@talent-management.com`
- Password: `dept123`
- User Metadata: `{"role": "DEPARTMENT", "name": "現場担当者", "department": "製造部"}`

### Step 6.2: 動作確認

1. **本番サイトにアクセス**
2. **ログインページでテスト**
3. **ダッシュボードの表示確認**

---

## 7️⃣ トラブルシューティング

### 問題1: 認証エラー

**症状**: ログインできない

**解決方法**:
1. SupabaseのAPI キーが正しく設定されているか確認
2. Authentication設定でEmail認証が有効になっているか確認
3. ユーザーが正しく作成されているか確認

### 問題2: データが表示されない

**症状**: ダッシュボードにデータが表示されない

**解決方法**:
1. RLSポリシーが正しく設定されているか確認
2. テーブルにデータが正しく挿入されているか確認
3. APIルートが正しく動作しているか確認

### 問題3: CORSエラー

**症状**: ブラウザでCORSエラーが発生

**解決方法**:
1. Supabaseの設定でドメインが許可されているか確認
2. 環境変数が正しく設定されているか確認

---

## 🎉 完了！

これで、Vercel + Supabase SDK での本番環境が完成しました！

### 📊 管理画面

- **Vercel**: https://vercel.com/dashboard
- **Supabase**: https://drmptaaooecrtlqpphhv.supabase.co
- **GitHub**: https://github.com/ryomasakamotonorisuke/talent-management-system

### 🌐 アクセスURL

- **本番環境**: `https://your-app.vercel.app`
- **ログインページ**: `https://your-app.vercel.app/login`
- **ダッシュボード**: `https://your-app.vercel.app/dashboard`

### 👥 デモアカウント

- **管理者**: `admin@talent-management.com` / `admin123`
- **部署担当者**: `dept@talent-management.com` / `dept123`

---

**Supabase SDKの利点**:
- ✅ リアルタイム機能
- ✅ 自動認証管理
- ✅ 行レベルセキュリティ
- ✅ 簡単なAPI呼び出し
- ✅ 自動スケーリング
