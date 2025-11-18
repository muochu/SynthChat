import { NextRequest, NextResponse } from 'next/server'
import { AnalysisRequest } from '@/types/insights'
import { analyzeChats } from '@/lib/analysis/chatAnalyzer'

export async function POST(request: NextRequest) {
  try {
    const body: AnalysisRequest = await request.json()
    const { chats } = body

    if (!chats || !Array.isArray(chats) || chats.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request. Chats array is required and must not be empty.' },
        { status: 400 }
      )
    }

    const insights = analyzeChats(chats)

    return NextResponse.json({ insights })
  } catch (error) {
    console.error('Error in analyze route:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

