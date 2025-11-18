import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

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
      model: 'claude-3-opus-20240229',
      max_tokens: 4096,
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
  const client = getOpenAIClient()
  const response = await client.chat.completions.create({
    model: 'gpt-4-turbo-preview',
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
}

