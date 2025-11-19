import { Chat, ChatMessage } from '@/types/chat'
import {
  ChatInsights,
  TopicFrequency,
  FAQ,
  TimeSavings,
} from '@/types/insights'
import {
  BASE_MINUTES_PER_CHAT,
  MINUTES_PER_MESSAGE_PAIR,
} from '@/lib/constants'

// Normalizes topics by grouping similar ones under umbrella categories
export function normalizeTopic(topic: string): string {
  const lower = topic.toLowerCase()

  // Privacy/Data Protection topics
  if (lower.includes('ccpa') || lower.includes('cpra')) {
    if (lower.includes('privacy policy') || lower.includes('policy update')) {
      return 'CCPA/CPRA Privacy Policy Compliance'
    }
    if (
      lower.includes('data breach') ||
      lower.includes('breach notification')
    ) {
      return 'CCPA/CPRA Data Breach Requirements'
    }
    if (lower.includes('disclosure') || lower.includes('consumer rights')) {
      return 'CCPA/CPRA Disclosure Requirements'
    }
    return 'CCPA/CPRA Compliance'
  }

  if (lower.includes('gdpr')) {
    if (lower.includes('privacy policy') || lower.includes('policy update')) {
      return 'GDPR Privacy Policy Compliance'
    }
    if (
      lower.includes('data breach') ||
      lower.includes('breach notification')
    ) {
      return 'GDPR Data Breach Requirements'
    }
    if (
      lower.includes('data subject rights') ||
      lower.includes('data subject access')
    ) {
      return 'GDPR Data Subject Rights'
    }
    if (
      lower.includes('data transfer') ||
      lower.includes('scc') ||
      lower.includes('cross-border')
    ) {
      return 'GDPR Data Transfer Requirements'
    }
    return 'GDPR Compliance'
  }

  if (
    lower.includes('privacy policy') &&
    !lower.includes('ccpa') &&
    !lower.includes('gdpr') &&
    !lower.includes('cpra')
  ) {
    return 'Privacy Policy Updates'
  }

  if (lower.includes('data breach')) {
    return 'Data Breach Notification Requirements'
  }

  if (lower.includes('hipaa') || lower.includes('phi')) {
    return 'HIPAA Compliance'
  }

  if (lower.includes('cookie') || lower.includes('tracking')) {
    return 'Cookie Consent & Tracking Compliance'
  }

  if (lower.includes('biometric') || lower.includes('bipa')) {
    return 'Biometric Data Compliance'
  }

  // Commercial/Contract topics
  if (
    lower.includes('software license') ||
    lower.includes('license agreement')
  ) {
    return 'Software License Agreement Review'
  }

  if (
    lower.includes('msa') ||
    (lower.includes('master service') && lower.includes('agreement'))
  ) {
    if (lower.includes('saas')) {
      return 'SaaS MSA Development'
    }
    return 'MSA Development & Templates'
  }

  if (
    lower.includes('vendor agreement') ||
    (lower.includes('vendor') && lower.includes('negotiation'))
  ) {
    return 'Vendor Agreement Negotiations'
  }

  if (
    lower.includes('terms of service') ||
    lower.includes('terms and conditions')
  ) {
    return 'Terms of Service Updates'
  }

  if (lower.includes('indemnification') || lower.includes('liability')) {
    return 'Indemnification & Liability Provisions'
  }

  if (lower.includes('non-compete') || lower.includes('noncompete')) {
    return 'Non-Compete Clause Analysis'
  }

  if (
    lower.includes('sow') ||
    (lower.includes('statement') && lower.includes('work'))
  ) {
    return 'SOW & Customer Agreement Review'
  }

  // Return original if no match found
  return topic
}

// Counts how often each topic appears and calculates percentages
// Groups similar topics under umbrella categories
function extractTopics(chats: Chat[]): TopicFrequency[] {
  const topicMap = new Map<string, number>()

  chats.forEach(chat => {
    if (chat.topic) {
      const normalized = normalizeTopic(chat.topic)
      const current = topicMap.get(normalized) || 0
      topicMap.set(normalized, current + 1)
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
    .filter(faq => faq.frequency > 1)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10)

  return faqs
}

// Calculates time saved per chat based on message count
function calculateTimeSavedPerChat(chat: Chat): number {
  const messageCount = chat.messages.length
  const messagePairs = Math.floor(messageCount / 2)
  return BASE_MINUTES_PER_CHAT + messagePairs * MINUTES_PER_MESSAGE_PAIR
}

// Calculates total time saved, broken down by lawyer type
function calculateTimeSavings(chats: Chat[]): TimeSavings {
  const privacyChats = chats.filter(c => c.lawyerType === 'privacy')
  const commercialChats = chats.filter(c => c.lawyerType === 'commercial')

  const privacyMinutes = privacyChats.reduce(
    (sum, chat) => sum + calculateTimeSavedPerChat(chat),
    0
  )
  const commercialMinutes = commercialChats.reduce(
    (sum, chat) => sum + calculateTimeSavedPerChat(chat),
    0
  )

  const totalMinutes = privacyMinutes + commercialMinutes
  const averagePerChat = chats.length > 0 ? totalMinutes / chats.length : 0

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

  // Only show most common topic if it appears multiple times
  if (topics.length > 0 && topics[0].count > 1) {
    const chatWord = topics[0].count === 1 ? 'chat' : 'chats'
    insights.push(
      `Most common topic: ${topics[0].topic} (appeared in ${topics[0].count} ${chatWord})`
    )
  } else if (topics.length > 0) {
    insights.push(`Generated ${topics.length} unique legal topics`)
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
