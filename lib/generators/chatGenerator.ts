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

interface LLMChatResponse {
  messages: ChatMessage[]
  topic: string
}

function parseLLMResponse(response: string): LLMChatResponse {
  try {
    const cleaned = response.trim()
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }
    return JSON.parse(jsonMatch[0])
  } catch (error) {
    throw new Error(`Failed to parse LLM response: ${error}`)
  }
}

export async function generatePrivacyChat(): Promise<Chat> {
  const systemPrompt = PRIVACY_LAWYER_SYSTEM_PROMPT
  const userPrompt = PRIVACY_LAWYER_CHAT_PROMPT

  const response = await generateWithAnthropic(userPrompt, systemPrompt)
  const parsed = parseLLMResponse(response)

  return {
    id: `privacy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    lawyerType: 'privacy',
    messages: parsed.messages,
    topic: parsed.topic,
  }
}

export async function generateCommercialChat(): Promise<Chat> {
  const systemPrompt = COMMERCIAL_LAWYER_SYSTEM_PROMPT
  const userPrompt = COMMERCIAL_LAWYER_CHAT_PROMPT

  const response = await generateWithAnthropic(userPrompt, systemPrompt)
  const parsed = parseLLMResponse(response)

  return {
    id: `commercial-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    lawyerType: 'commercial',
    messages: parsed.messages,
    topic: parsed.topic,
  }
}

export async function generatePrivacyChats(count: number = 10): Promise<Chat[]> {
  const chats: Chat[] = []
  for (let i = 0; i < count; i++) {
    const chat = await generatePrivacyChat()
    chats.push(chat)
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  return chats
}

export async function generateCommercialChats(
  count: number = 10
): Promise<Chat[]> {
  const chats: Chat[] = []
  for (let i = 0; i < count; i++) {
    const chat = await generateCommercialChat()
    chats.push(chat)
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  return chats
}

