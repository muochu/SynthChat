import { NextRequest, NextResponse } from 'next/server'
import { render } from '@react-email/components'
import React from 'react'
import InsightsEmail from '@/components/email/InsightsEmail'
import { ChatInsights } from '@/types/insights'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { insights }: { insights: ChatInsights } = body

    if (!insights) {
      return NextResponse.json(
        { error: 'Insights data is required' },
        { status: 400 }
      )
    }

    const EmailComponent = React.createElement(InsightsEmail, { insights })
    const emailHtml = await render(EmailComponent)

    return NextResponse.json({ html: emailHtml })
  } catch (error) {
    console.error('Error in email route:', error)
    console.error('Error details:', error instanceof Error ? error.stack : error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

