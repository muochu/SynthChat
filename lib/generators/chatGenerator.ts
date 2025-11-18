import { Chat, ChatMessage } from '@/types/chat'
import { generateWithAnthropic } from '@/lib/llm/clients'
import {
  PRIVACY_LAWYER_SYSTEM_PROMPT,
  PRIVACY_LAWYER_CHAT_PROMPT,
} from '@/lib/prompts/privacy'
import {
  COMMERCIAL_LAWYER_SYSTEM_PROMPT,
  COMMERCIAL_LAWYER_CHAT_PROMPT,
} from '@/lib/prompts/commercial'
import {
  DEFAULT_CHAT_COUNT,
  BATCH_SIZE,
  BATCH_DELAY_MS,
  RETRY_DELAY_MS,
  MAX_RETRIES,
} from '@/lib/constants'

interface LLMChatResponse {
  messages: ChatMessage[]
  topic: string
}

// Extracts JSON from LLM response, handles markdown blocks and fixes common issues
function parseLLMResponse(response: string): LLMChatResponse {
  try {
    let cleaned = response.trim()

    const codeBlockMatch = cleaned.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
    if (codeBlockMatch) {
      cleaned = codeBlockMatch[1]
    } else {
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleaned = jsonMatch[0]
      }
    }

    if (!cleaned) {
      throw new Error('No JSON found in response')
    }

    // Remove trailing commas and fix newlines
    cleaned = cleaned
      .replace(/,\s*([}\]])/g, '$1')
      .replace(/([^\\])\\n/g, '$1\\n')
      .replace(/([^\\])"/g, (match, before) => {
        const quotesCount = (cleaned.match(/"/g) || []).length
        if (quotesCount % 2 !== 0 && before !== '\\') {
          return match
        }
        return match
      })

    const parsed = JSON.parse(cleaned)

    if (!parsed.messages || !Array.isArray(parsed.messages)) {
      throw new Error('Invalid JSON structure: missing messages array')
    }

    if (!parsed.topic || typeof parsed.topic !== 'string') {
      throw new Error('Invalid JSON structure: missing topic')
    }

    return parsed
  } catch (error) {
    console.error('JSON parsing error:', error)
    console.error('Response snippet:', response.substring(0, 500))
    throw new Error(
      `Failed to parse LLM response: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// Generates one privacy lawyer chat, retries on failure
export async function generatePrivacyChat(
  retries = MAX_RETRIES
): Promise<Chat> {
  const systemPrompt = PRIVACY_LAWYER_SYSTEM_PROMPT
  const userPrompt = PRIVACY_LAWYER_CHAT_PROMPT

  try {
    const response = await generateWithAnthropic(userPrompt, systemPrompt)
    const parsed = parseLLMResponse(response)

    return {
      id: `privacy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lawyerType: 'privacy',
      messages: parsed.messages,
      topic: parsed.topic,
    }
  } catch (error) {
    if (retries > 0) {
      console.log(
        `Retrying privacy chat generation (${retries} retries left)...`
      )
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))
      return generatePrivacyChat(retries - 1)
    }
    throw error
  }
}

// Generates one commercial lawyer chat, retries on failure
export async function generateCommercialChat(
  retries = MAX_RETRIES
): Promise<Chat> {
  const systemPrompt = COMMERCIAL_LAWYER_SYSTEM_PROMPT
  const userPrompt = COMMERCIAL_LAWYER_CHAT_PROMPT

  try {
    const response = await generateWithAnthropic(userPrompt, systemPrompt)
    const parsed = parseLLMResponse(response)

    return {
      id: `commercial-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lawyerType: 'commercial',
      messages: parsed.messages,
      topic: parsed.topic,
    }
  } catch (error) {
    if (retries > 0) {
      console.log(
        `Retrying commercial chat generation (${retries} retries left)...`
      )
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))
      return generateCommercialChat(retries - 1)
    }
    throw error
  }
}

// Helper to generate chats in batches
async function generateChatsInBatches(
  generateFn: () => Promise<Chat>,
  count: number
): Promise<Chat[]> {
  const chats: Chat[] = []

  for (let i = 0; i < count; i += BATCH_SIZE) {
    const batch = Array.from({ length: Math.min(BATCH_SIZE, count - i) }, () =>
      generateFn()
    )
    const batchResults = await Promise.all(batch)
    chats.push(...batchResults)

    if (i + BATCH_SIZE < count) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS))
    }
  }

  return chats
}

// Generates multiple privacy chats in parallel batches
export async function generatePrivacyChats(
  count: number = DEFAULT_CHAT_COUNT
): Promise<Chat[]> {
  return generateChatsInBatches(generatePrivacyChat, count)
}

// Generates multiple commercial chats in parallel batches
export async function generateCommercialChats(
  count: number = DEFAULT_CHAT_COUNT
): Promise<Chat[]> {
  return generateChatsInBatches(generateCommercialChat, count)
}
