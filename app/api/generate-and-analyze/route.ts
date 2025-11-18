import { NextResponse } from 'next/server'
import {
  generatePrivacyChats,
  generateCommercialChats,
} from '@/lib/generators/chatGenerator'
import { analyzeChats } from '@/lib/analysis/chatAnalyzer'

export async function POST() {
  try {
    const [privacyChats, commercialChats] = await Promise.all([
      generatePrivacyChats(10),
      generateCommercialChats(10),
    ])

    const allChats = [...privacyChats, ...commercialChats]
    const insights = analyzeChats(allChats)

    return NextResponse.json({
      chats: allChats,
      insights,
    })
  } catch (error) {
    console.error('Error in generate-and-analyze route:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

