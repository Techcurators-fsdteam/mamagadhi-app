import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Debug all environment variables
    console.log('=== Environment Variables Debug ===')
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('VERCEL:', process.env.VERCEL)
    console.log(
      'All env keys:',
      Object.keys(process.env).filter((key) => key.includes('SUPABASE'))
    )

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log('Supabase URL:', supabaseUrl ? 'EXISTS' : 'MISSING')
    console.log(
      'Service Key:',
      supabaseServiceKey
        ? `EXISTS (${supabaseServiceKey.substring(0, 20)}...)`
        : 'MISSING'
    )

    if (!supabaseUrl) {
      console.error('NEXT_PUBLIC_SUPABASE_URL is missing')
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase URL' },
        { status: 500 }
      )
    }

    if (!supabaseServiceKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is missing')
      return NextResponse.json(
        { error: 'Server configuration error: Missing service key' },
        { status: 500 }
      )
    }

    // Service role client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('Fetching profile for user:', userId)

    // Get user profile from Supabase
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Supabase query error:', error)
      return NextResponse.json(
        { error: `User profile not found: ${error.message}` },
        { status: 404 }
      )
    }

    console.log('Profile found:', data?.email)
    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
