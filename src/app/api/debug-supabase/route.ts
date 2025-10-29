import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('=== Supabase Configuration Debug ===');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Anon Key (first 20 chars):', supabaseAnonKey?.substring(0, 20));
    
    // URLからリージョン情報を抽出
    const urlParts = supabaseUrl?.split('.');
    console.log('URL parts:', urlParts);
    
    // Supabaseのヘルスチェックエンドポイントにアクセス
    const healthUrl = `${supabaseUrl}/rest/v1/`;
    console.log('Health check URL:', healthUrl);
    
    try {
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey || '',
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Health check response status:', response.status);
      console.log('Health check response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        return NextResponse.json({
          status: 'OK',
          message: 'Supabase connection successful',
          url: supabaseUrl,
          region: 'Detected from URL',
          timestamp: new Date().toISOString()
        });
      } else {
        const errorText = await response.text();
        console.log('Health check error response:', errorText);
        return NextResponse.json({
          error: 'Supabase health check failed',
          status: response.status,
          details: errorText
        }, { status: 500 });
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json({
        error: 'Network error',
        details: fetchError instanceof Error ? fetchError.message : 'Unknown error'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
