import { NextResponse } from 'next/server'
import {
  generatePrivacyChats,
  generateCommercialChats,
} from '@/lib/generators/chatGenerator'
import { analyzeChats } from '@/lib/analysis/chatAnalyzer'
import { DEFAULT_CHAT_COUNT } from '@/lib/constants'

export async function POST() {
  try {
    console.log('Starting chat generation...')
    const [privacyChats, commercialChats] = await Promise.all([
      generatePrivacyChats(DEFAULT_CHAT_COUNT),
      generateCommercialChats(DEFAULT_CHAT_COUNT),
    ])

    console.log(`Generated ${privacyChats.length} privacy chats and ${commercialChats.length} commercial chats`)

    const allChats = [...privacyChats, ...commercialChats]
    const insights = analyzeChats(allChats)

    return NextResponse.json({
      chats: allChats,
      insights,
    })
  } catch (error) {
    console.error('Error in generate-and-analyze route:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    console.error('Error details:', errorMessage, errorStack)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}

