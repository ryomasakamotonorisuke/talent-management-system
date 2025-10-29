# 🔍 Supabase 接続URL 取得の詳細ガイド

「接続URLの取得」の具体的な手順です。

## 📍 Supabaseダッシュボードでの操作手順

### Step 1: Settings（設定）画面を開く

1. **Supabaseダッシュボードにログイン**
   - https://supabase.com/dashboard にアクセス
   - プロジェクト `talent-management-system` を選択

2. **左サイドバーから「Settings」をクリック**
   - 左メニューの一番下の歯車アイコンが「Settings」
   - クリックすると右側に設定メニューが表示されます

3. **「Database」をクリック**
   - Settingsメニューの中に「Database」があります
   - これをクリックします

### Step 2: Connection string（接続文字列）を探す

Database ページが開くと、以下のセクションが表示されます：

#### 表示されるセクション一覧：
```
📦 Connection info
   - Host
   - Database
   - Port
   - User

🔑 Connection string
   - URI
   - JDBC
   - Session Mode
```

### Step 3: URI（接続URL）をコピー

1. **「Connection string」セクションを探す**
   - 画面をスクロールすると「Connection string」という見出しがあります

2. **「URI」タブをクリック**
   - Connection string セクションに3つのタブがあります：
     - **URI** ← これをクリック
     - JDBC
     - Session Mode

3. **表示される接続URL**
   - URIタブをクリックすると、以下のような文字列が表示されます：

```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

   - 具体的な例：
```
postgresql://postgres.zgcfkdwgxwqzrzvqmyfr:MyPassword123!@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

4. **文字列全体をコピー**
   - 表示された文字列全体を選択（Ctrl+A）
   - コピー（Ctrl+C）

### Step 4: [YOUR-PASSWORD] を実際のパスワードに置き換える

⚠️ **重要**: コピーしたURLの中の `[YOUR-PASSWORD]` の部分は、プロジェクト作成時に設定した**データベースパスワード**に置き換える必要があります。

#### 置き換え方法：

**コピーしたURL（例）**:
```
postgresql://postgres.zgcfkdwgxwqzrzvqmyfr:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

**置き換え後**:
```
postgresql://postgres.zgcfkdwgxwqzrzvqmyfr:MyStr0ng!P@ssw0rd#2024@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

📝 **手順**:
1. メモ帳やテキストエディタを開く
2. コピーしたURLを貼り付け（Ctrl+V）
3. `[YOUR-PASSWORD]` の部分を見つける
4. プロジェクト作成時に設定したパスワードで置き換える
5. これが最終的な `DATABASE_URL` になります

### Step 5: .env.local ファイルに設定

置き換えた接続URLを `.env.local` ファイルに設定します：

```env
DATABASE_URL="postgresql://postgres.zgcfkdwgxwqzrzvqmyfr:MyStr0ng!P@ssw0rd#2024@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"
```

⚠️ **注意点**:
- URL全体をダブルクォート（"）で囲む
- パスワードに特殊文字が含まれる場合、そのまま使用可能
- URLは長いので、全体がコピーされていることを確認

---

## 🖼️ 視覚的な補足説明

### Supabaseダッシュボードの画面構成：

```
┌─────────────────────────────────────────────┐
│  Supabase Dashboard                        │
├──────────┬──────────────────────────────────┤
│          │  Settings                        │
│          ├──────────────────────────────────┤
│ Sidebar  │  ↓ Database                     │
│          │                                   │
│ Projects │  Connection info                │
│ SQL      │  Host: ...                       │
│ Table    │  Database: postgres              │
│ ...      │  Port: 6543                      │
│          │  User: postgres                  │
│ Settings │                                   │
│          │  Connection string              │
│          │  ┌──────┬──────┬──────────┐     │
│          │  │ URI  │ JDBC │ Session  │ ← ここをクリック
│          │  └──────┴──────┴──────────┘     │
│          │  [コピーボタン]                  │
│          │  postgresql://postgres...       │
└──────────┴──────────────────────────────────┘
```

---

## ❓ よくある質問

### Q1: Connection stringセクションが見つからない

**A**: Settings メニューを開いた後、Database をクリックし、ページをスクロールダウンしてください。「Connection info」セクションの下にあります。

### Q2: パスワードがわからない

**A**: プロジェクト作成時に設定したパスワードです。Supabaseではパスワードの再表示ができません。パスワードを忘れた場合は、データベースパスワードをリセットする必要があります。

### Q3: URLが途切れてしまう

**A**: 長いURLなので、コピーボタンを使用するか、文字列全体を選択してからコピーしてください。

### Q4: パスワードに特殊文字が含まれている

**A**: URLエンコードが必要な場合がありますが、Supabaseの接続URLは基本的に特殊文字そのままで動作します。

---

このガイドで「Connection string」の取得と設定ができるはずです。他に不明点があれば教えてください！
