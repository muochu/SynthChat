import { NextRequest, NextResponse } from 'next/server'
import { ChatGenerationRequest } from '@/types/chat'
import {
  generatePrivacyChats,
  generateCommercialChats,
} from '@/lib/generators/chatGenerator'

export async function POST(request: NextRequest) {
  try {
    const body: ChatGenerationRequest = await request.json()
    const { lawyerType, count = 10 } = body

    if (lawyerType !== 'privacy' && lawyerType !== 'commercial') {
      return NextResponse.json(
        { error: 'Invalid lawyerType. Must be "privacy" or "commercial"' },
        { status: 400 }
      )
    }

    if (count < 1 || count > 20) {
      return NextResponse.json(
        { error: 'Count must be between 1 and 20' },
        { status: 400 }
      )
    }

    const chats =
      lawyerType === 'privacy'
        ? await generatePrivacyChats(count)
        : await generateCommercialChats(count)

    return NextResponse.json({ chats })
  } catch (error) {
    console.error('Error in generate route:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

