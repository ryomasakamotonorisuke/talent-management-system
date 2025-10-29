import { NextRequest, NextResponse } from 'next/server';
import { supabase, testSupabaseConnection } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('Testing Supabase connection...')
    
    // 環境変数の確認
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('Environment variables:')
    console.log('- SUPABASE_URL:', supabaseUrl ? 'Set' : 'Not set')
    console.log('- SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Not set')
    console.log('- SERVICE_ROLE_KEY:', serviceRoleKey ? 'Set' : 'Not set')
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        error: 'Missing Supabase environment variables',
        details: {
          url: !!supabaseUrl,
          anonKey: !!supabaseAnonKey,
          serviceRoleKey: !!serviceRoleKey
        }
      }, { status: 500 })
    }
    
    // Supabase接続テスト
    const connectionTest = await testSupabaseConnection()
    
    if (!connectionTest) {
      return NextResponse.json({
        error: 'Supabase connection failed',
        url: supabaseUrl
      }, { status: 500 })
    }
    
    return NextResponse.json({
      status: 'OK',
      message: 'Supabase connection successful',
      url: supabaseUrl,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
