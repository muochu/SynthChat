import { Chat } from './chat'

export interface TopicFrequency {
  topic: string
  count: number
  percentage: number
}

export interface FAQ {
  question: string
  frequency: number
  category: string
}

export interface TimeSavings {
  totalMinutes: number
  totalHours: number
  perChatAverage: number
  privacyLawyer: {
    totalMinutes: number
    totalHours: number
    chatCount: number
  }
  commercialLawyer: {
    totalMinutes: number
    totalHours: number
    chatCount: number
  }
}

export interface ChatInsights {
  totalChats: number
  totalMessages: number
  topics: TopicFrequency[]
  topFAQs: FAQ[]
  timeSavings: TimeSavings
  keyInsights: string[]
}

