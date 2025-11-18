import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { ANTHROPIC_MODEL, OPENAI_MODEL, MAX_TOKENS } from '@/lib/constants'

export function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }
  return new Anthropic({ apiKey })
}

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set')
  }
  return new OpenAI({ apiKey })
}

export async function generateWithAnthropic(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  try {
    const client = getAnthropicClient()
    const response = await client.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt || undefined,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = response.content[0]
    if (content && content.type === 'text') {
      return content.text
    }
    throw new Error('Unexpected response type from Anthropic')
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Anthropic API error: ${error.message}`)
    }
    throw error
  }
}

export async function generateWithOpenAI(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  try {
    const client = getOpenAIClient()
    const response = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt },
      ],
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content in OpenAI response')
    }
    return content
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`OpenAI API error: ${error.message}`)
    }
    throw error
  }
}

