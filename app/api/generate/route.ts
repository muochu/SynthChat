import { NextRequest, NextResponse } from 'next/server'
import { ChatGenerationRequest } from '@/types/chat'

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

    return NextResponse.json({
      message: 'Chat generation endpoint ready',
      lawyerType,
      count,
    })
  } catch (error) {
    console.error('Error in generate route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

