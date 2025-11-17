import { NextResponse } from 'next/server'
import {
  generatePrivacyChats,
  generateCommercialChats,
} from '@/lib/generators/chatGenerator'

export async function POST() {
  try {
    const [privacyChats, commercialChats] = await Promise.all([
      generatePrivacyChats(10),
      generateCommercialChats(10),
    ])

    return NextResponse.json({
      privacy: privacyChats,
      commercial: commercialChats,
    })
  } catch (error) {
    console.error('Error in generate all route:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

