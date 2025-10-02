import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { fetchVideoMetadata } from '@/lib/youtube'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { videoId } = await request.json()

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    // Check if video already exists for this user
    const { data: existingVideo } = await supabase
      .from('videos')
      .select('id')
      .eq('user_id', user.id)
      .eq('youtube_id', videoId)
      .single()

    if (existingVideo) {
      return NextResponse.json(
        { error: 'Video already in your library' },
        { status: 409 }
      )
    }

    // Fetch video metadata from YouTube
    const metadata = await fetchVideoMetadata(videoId)

    // Insert video into database
    const { data: video, error: insertError } = await supabase
      .from('videos')
      .insert({
        user_id: user.id,
        ...metadata,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save video' },
        { status: 500 }
      )
    }

    return NextResponse.json({ video }, { status: 201 })
  } catch (error) {
    console.error('Error adding video:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add video' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: videos, error } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
    }

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}
