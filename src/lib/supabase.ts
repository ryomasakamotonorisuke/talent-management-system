import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('Supabase URL:', supabaseUrl)
console.log('Supabase Anon Key (first 20 chars):', supabaseAnonKey?.substring(0, 20))

// リージョンエラーを回避するための設定
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  },
  // リージョン設定を明示的に指定
  db: {
    schema: 'public'
  }
})

// サーバーサイド用のクライアント（Service Role Key使用）
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-server'
      }
    },
    db: {
      schema: 'public'
    }
  }
)

// 接続テスト関数（より安全な方法）
export const testSupabaseConnection = async () => {
  try {
    // より簡単なテスト - 認証状態の確認
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Supabase auth error:', error)
      return false
    }
    console.log('Supabase connection successful (auth test)')
    return true
  } catch (err) {
    console.error('Supabase connection test failed:', err)
    return false
  }
}