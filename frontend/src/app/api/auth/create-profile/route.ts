import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Access environment variables inside the function to ensure they're available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Debug logging
    console.log('Environment variables check:')
    console.log('Supabase URL exists:', !!supabaseUrl)
    console.log('Service key exists:', !!supabaseServiceKey)
    console.log('Service key length:', supabaseServiceKey?.length || 0)

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables')
      return NextResponse.json(
        { error: 'Server configuration error: Missing environment variables' },
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

    const userData = await request.json()

    // Validate required fields
    if (!userData.id || !userData.email || !userData.phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('Creating user profile for:', userData.email)

    // Create user profile in Supabase
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .insert([{
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: `Failed to create user profile: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('User profile created successfully:', data.id)
    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

