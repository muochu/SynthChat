import { NextRequest, NextResponse } from 'next/server'
import { render } from '@react-email/components'
import React from 'react'
import InsightsEmail from '@/components/email/InsightsEmail'
import { ChatInsights } from '@/types/insights'
import { chromium } from 'playwright'

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

    const browser = await chromium.launch({ headless: true })
    const page = await browser.newPage()
    await page.setContent(emailHtml, { waitUntil: 'domcontentloaded' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    })

    await browser.close()

    return NextResponse.json({
      html: emailHtml,
      pdf: Buffer.from(pdfBuffer).toString('base64'),
    })
  } catch (error) {
    console.error('Error in email route:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
