import { Chat, ChatMessage } from '@/types/chat'
import { generateWithAnthropic, generateWithOpenAI } from '@/lib/llm/clients'
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

    // Extract JSON from markdown code blocks
    const codeBlockMatch = cleaned.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
    if (codeBlockMatch) {
      cleaned = codeBlockMatch[1]
    } else {
      // Extract JSON object - find the first { and try to match to last }
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        cleaned = jsonMatch[0]
      }
    }

    if (!cleaned) {
      throw new Error('No JSON found in response')
    }

    // Fix invalid escape sequences - JSON doesn't support \'
    cleaned = cleaned.replace(/\\'/g, "'")

    // Fix unescaped control characters and handle truncated strings
    // Process each field systematically
    const fields = ['content', 'topic']

    fields.forEach(field => {
      // Find all instances of this field, including unclosed ones
      const regex = new RegExp(`"${field}":\\s*"([^"]*?)(?:"|$)`, 'g')
      const matches: Array<{
        match: string
        index: number
        value: string
        isClosed: boolean
      }> = []
      let match

      while ((match = regex.exec(cleaned)) !== null) {
        const fullMatch = match[0]
        const value = match[1] || ''
        const isClosed = fullMatch.endsWith('"')
        matches.push({
          match: fullMatch,
          index: match.index,
          value,
          isClosed,
        })
      }

      // Replace from end to start to preserve indices
      for (let i = matches.length - 1; i >= 0; i--) {
        const { match: fullMatch, value, isClosed } = matches[i]
        let fixedValue = value

        // Escape control characters properly
        fixedValue = fixedValue
          .replace(/\\n/g, '\n') // Convert escaped to actual
          .replace(/\n/g, '\\n') // Re-escape all
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t')
          .replace(/"/g, '\\"')
          .replace(/\\\\/g, '\\') // Fix double backslashes

        const replacement = `"${field}": "${fixedValue}"`
        cleaned =
          cleaned.substring(0, matches[i].index) +
          replacement +
          cleaned.substring(matches[i].index + fullMatch.length)
      }
    })

    // Remove trailing commas
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1')

    // Try to fix incomplete JSON - count braces and brackets
    let openBraces = (cleaned.match(/\{/g) || []).length
    let closeBraces = (cleaned.match(/\}/g) || []).length
    let openBrackets = (cleaned.match(/\[/g) || []).length
    let closeBrackets = (cleaned.match(/\]/g) || []).length

    // Close incomplete arrays first
    if (openBrackets > closeBrackets) {
      cleaned += ']'.repeat(openBrackets - closeBrackets)
    }

    // Close incomplete objects
    if (openBraces > closeBraces) {
      cleaned += '}'.repeat(openBraces - closeBraces)
    }

    // Ensure topic field exists even if missing
    if (!cleaned.includes('"topic"')) {
      // Extract messages array first
      const messagesMatch = cleaned.match(/"messages":\s*(\[[\s\S]*\])/)
      if (messagesMatch) {
        const firstMessage =
          messagesMatch[1].match(/"content":\s*"([^"]{0,100})/)?.[1] ||
          'Chat conversation'
        const topicGuess = firstMessage.substring(0, 80).replace(/"/g, '\\"')
        cleaned = cleaned.replace(
          /"messages"/,
          `"topic": "${topicGuess}",\n  "messages"`
        )
      }
    }

    const parsed = JSON.parse(cleaned)

    // Validate and fix structure
    if (!parsed.messages || !Array.isArray(parsed.messages)) {
      throw new Error('Invalid JSON structure: missing messages array')
    }

    if (!parsed.topic || typeof parsed.topic !== 'string') {
      // Generate topic from first message
      const firstUserMsg = parsed.messages.find(
        (m: { role: string }) => m.role === 'user'
      )
      parsed.topic = firstUserMsg?.content?.substring(0, 80) || 'Untitled chat'
    }

    return parsed
  } catch (error) {
    console.error('JSON parsing error:', error)
    console.error('Response length:', response.length)
    console.error(
      'Response snippet (first 800 chars):',
      response.substring(0, 800)
    )
    console.error(
      'Response snippet (last 200 chars):',
      response.substring(Math.max(0, response.length - 200))
    )
    throw new Error(
      `Failed to parse LLM response: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

// Builds topic tracking prompt addition
function buildTopicTrackingPrompt(
  usedTopics: string[],
  commonKeywords: string[],
  contextNote: string
): string {
  if (usedTopics.length === 0) return ''
  const commonTopics = usedTopics.filter(topic =>
    commonKeywords.some(keyword => topic.toLowerCase().includes(keyword))
  )
  if (commonTopics.length === 0) return ''

  const topicCounts = new Map<string, number>()
  usedTopics.forEach(topic => {
    topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1)
  })
  const repeatedTopics = Array.from(topicCounts.entries())
    .filter(([_, count]) => count >= 1 && count < 3)
    .map(([topic, count]) => `${topic} (used ${count}x)`)
    .slice(0, 3)

  if (repeatedTopics.length === 0) return ''
  return `\n\nNote: Earlier chats have covered these topics: ${repeatedTopics.join(', ')}. ${contextNote}`
}

export async function generatePrivacyChat(
  retries = MAX_RETRIES,
  usedTopics: string[] = []
): Promise<Chat> {
  let userPrompt = PRIVACY_LAWYER_CHAT_PROMPT
  const topicPrompt = buildTopicTrackingPrompt(
    usedTopics,
    ['ccpa', 'gdpr', 'privacy policy', 'data breach'],
    'Feel free to revisit any of these - in real practice, lawyers often ask about the same compliance areas multiple times as new scenarios arise.'
  )
  userPrompt += topicPrompt

  try {
    const response = await generateWithAnthropic(
      userPrompt,
      PRIVACY_LAWYER_SYSTEM_PROMPT
    )
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
      return generatePrivacyChat(retries - 1, usedTopics)
    }
    throw error
  }
}

export async function generateCommercialChat(
  retries = MAX_RETRIES,
  usedTopics: string[] = []
): Promise<Chat> {
  let userPrompt = COMMERCIAL_LAWYER_CHAT_PROMPT
  const topicPrompt = buildTopicTrackingPrompt(
    usedTopics,
    ['msa', 'software license', 'vendor', 'saas'],
    'Feel free to revisit any of these - in real practice, commercial lawyers often review similar contract types multiple times with different vendors or contexts.'
  )
  userPrompt += topicPrompt

  try {
    const response = await generateWithOpenAI(
      userPrompt,
      COMMERCIAL_LAWYER_SYSTEM_PROMPT
    )
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
      return generateCommercialChat(retries - 1, usedTopics)
    }
    throw error
  }
}

// Helper to generate chats in batches with topic tracking
async function generateChatsInBatches(
  generateFn: (usedTopics: string[]) => Promise<Chat>,
  count: number
): Promise<Chat[]> {
  const chats: Chat[] = []
  const usedTopics: string[] = []

  for (let i = 0; i < count; i += BATCH_SIZE) {
    const batchSize = Math.min(BATCH_SIZE, count - i)
    const batch = Array.from({ length: batchSize }, () =>
      generateFn(usedTopics)
    )
    const batchResults = await Promise.all(batch)
    chats.push(...batchResults)

    batchResults.forEach(chat => {
      if (chat.topic) {
        usedTopics.push(chat.topic)
      }
    })

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
  return generateChatsInBatches(
    (usedTopics: string[]) => generatePrivacyChat(MAX_RETRIES, usedTopics),
    count
  )
}

// Generates multiple commercial chats in parallel batches
export async function generateCommercialChats(
  count: number = DEFAULT_CHAT_COUNT
): Promise<Chat[]> {
  return generateChatsInBatches(
    (usedTopics: string[]) => generateCommercialChat(MAX_RETRIES, usedTopics),
    count
  )
}
