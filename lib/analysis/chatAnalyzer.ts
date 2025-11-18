import { Chat, ChatMessage } from '@/types/chat'
import {
  ChatInsights,
  TopicFrequency,
  FAQ,
  TimeSavings,
} from '@/types/insights'

// Time saved per chat estimate - traditional research takes 30-60 min
const ESTIMATED_MINUTES_PER_CHAT = 35

// Counts how often each topic appears and calculates percentages
function extractTopics(chats: Chat[]): TopicFrequency[] {
  const topicMap = new Map<string, number>()

  chats.forEach(chat => {
    if (chat.topic) {
      const current = topicMap.get(chat.topic) || 0
      topicMap.set(chat.topic, current + 1)
    }
  })

  const total = chats.length
  const topics: TopicFrequency[] = Array.from(topicMap.entries()).map(
    ([topic, count]) => ({
      topic,
      count,
      percentage: Math.round((count / total) * 100),
    })
  )

  return topics.sort((a, b) => b.count - a.count)
}

// Pulls out the first question from each chat and finds the most common ones
function extractFAQs(chats: Chat[]): FAQ[] {
  const faqMap = new Map<string, { question: string; category: string }>()

  chats.forEach(chat => {
    chat.messages.forEach((msg: ChatMessage, index: number) => {
      if (msg.role === 'user' && index === 0) {
        const normalized = msg.content.toLowerCase().trim()
        if (!faqMap.has(normalized)) {
          faqMap.set(normalized, {
            question: msg.content.trim(),
            category: chat.lawyerType,
          })
        }
      }
    })
  })

  const questionFreq = new Map<string, number>()
  chats.forEach(chat => {
    const firstUserMsg = chat.messages.find(m => m.role === 'user')
    if (firstUserMsg) {
      const normalized = firstUserMsg.content.toLowerCase().trim()
      questionFreq.set(normalized, (questionFreq.get(normalized) || 0) + 1)
    }
  })

  const faqs: FAQ[] = Array.from(faqMap.entries())
    .map(([normalized, data]) => ({
      question: data.question,
      frequency: questionFreq.get(normalized) || 1,
      category: data.category,
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10)

  return faqs
}

// Calculates total time saved, broken down by lawyer type
function calculateTimeSavings(chats: Chat[]): TimeSavings {
  const privacyChats = chats.filter(c => c.lawyerType === 'privacy')
  const commercialChats = chats.filter(c => c.lawyerType === 'commercial')

  const privacyMinutes = privacyChats.length * ESTIMATED_MINUTES_PER_CHAT
  const commercialMinutes =
    commercialChats.length * ESTIMATED_MINUTES_PER_CHAT

  const totalMinutes = privacyMinutes + commercialMinutes
  const averagePerChat =
    chats.length > 0 ? totalMinutes / chats.length : 0

  return {
    totalMinutes,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    perChatAverage: Math.round(averagePerChat * 10) / 10,
    privacyLawyer: {
      totalMinutes: privacyMinutes,
      totalHours: Math.round((privacyMinutes / 60) * 10) / 10,
      chatCount: privacyChats.length,
    },
    commercialLawyer: {
      totalMinutes: commercialMinutes,
      totalHours: Math.round((commercialMinutes / 60) * 10) / 10,
      chatCount: commercialChats.length,
    },
  }
}

function generateKeyInsights(
  chats: Chat[],
  topics: TopicFrequency[],
  timeSavings: TimeSavings
): string[] {
  const insights: string[] = []

  if (topics.length > 0) {
    insights.push(
      `Most common topic: ${topics[0].topic} (appeared in ${topics[0].count} chats)`
    )
  }

  insights.push(
    `Total time saved: ${timeSavings.totalHours} hours across ${chats.length} conversations`
  )

  if (timeSavings.privacyLawyer.chatCount > 0) {
    insights.push(
      `Privacy lawyers saved an average of ${Math.round(timeSavings.privacyLawyer.totalMinutes / timeSavings.privacyLawyer.chatCount)} minutes per conversation`
    )
  }

  if (timeSavings.commercialLawyer.chatCount > 0) {
    insights.push(
      `Commercial lawyers saved an average of ${Math.round(timeSavings.commercialLawyer.totalMinutes / timeSavings.commercialLawyer.chatCount)} minutes per conversation`
    )
  }

  const avgMessagesPerChat =
    chats.length > 0
      ? chats.reduce((sum, chat) => sum + chat.messages.length, 0) /
        chats.length
      : 0

  if (avgMessagesPerChat > 0) {
    insights.push(
      `Average conversation depth: ${Math.round(avgMessagesPerChat * 10) / 10} messages per chat`
    )
  }

  const uniqueTopics = new Set(chats.map(c => c.topic).filter(Boolean)).size
  if (uniqueTopics > 0) {
    insights.push(`Covered ${uniqueTopics} distinct legal topics`)
  }

  return insights
}

// Main function that analyzes all chats and returns insights for the email
export function analyzeChats(chats: Chat[]): ChatInsights {
  const topics = extractTopics(chats)
  const topFAQs = extractFAQs(chats)
  const timeSavings = calculateTimeSavings(chats)
  const keyInsights = generateKeyInsights(chats, topics, timeSavings)

  const totalMessages = chats.reduce(
    (sum, chat) => sum + chat.messages.length,
    0
  )

  return {
    totalChats: chats.length,
    totalMessages,
    topics,
    topFAQs,
    timeSavings,
    keyInsights,
  }
}

