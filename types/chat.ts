export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface Chat {
  id: string
  lawyerType: 'privacy' | 'commercial'
  messages: ChatMessage[]
  topic?: string
}

