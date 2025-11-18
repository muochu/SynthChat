'use client'

import { useState } from 'react'
import Button from '@/components/button'
import Card from '@/components/card'
import { ChatInsights } from '@/types/insights'
import { Chat } from '@/types/chat'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 20, message: '' })
  const [insights, setInsights] = useState<ChatInsights | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [emailHtml, setEmailHtml] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedChats, setExpandedChats] = useState<Set<string>>(new Set())

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setInsights(null)
    setChats([])
    setEmailHtml(null)
    setExpandedChats(new Set())
    setLoadingProgress({ current: 0, total: 20, message: 'Starting generation...' })

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev.current >= prev.total) return prev
        const newCurrent = Math.min(prev.current + 1, prev.total)
        const isPrivacy = newCurrent <= 10
        const chatNum = isPrivacy ? newCurrent : newCurrent - 10
        const type = isPrivacy ? 'privacy' : 'commercial'
        return {
          current: newCurrent,
          total: 20,
          message: `Generating ${type} chat ${chatNum}/10...`,
        }
      })
    }, 2000)

    try {
      const response = await fetch('/api/generate-and-analyze', {
        method: 'POST',
      })

      clearInterval(progressInterval)
      setLoadingProgress({ current: 20, total: 20, message: 'Analyzing insights...' })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.details || data.error || 'Failed to generate chats and insights'
        throw new Error(errorMsg)
      }

      setInsights(data.insights)
      setChats(data.chats || [])
      setLoadingProgress({ current: 20, total: 20, message: 'Generating email...' })

      const emailResponse = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insights: data.insights }),
      })

      if (emailResponse.ok) {
        const emailData = await emailResponse.json()
        setEmailHtml(emailData.html)
      } else {
        const errorData = await emailResponse.json()
        console.error('Email generation error:', errorData)
      }
    } catch (err) {
      clearInterval(progressInterval)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
      setLoadingProgress({ current: 0, total: 20, message: '' })
    }
  }

  const exportChatsJSON = () => {
    const dataStr = JSON.stringify(chats, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'synthchat-chats.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportChatsCSV = () => {
    const headers = ['ID', 'Lawyer Type', 'Topic', 'Message Count', 'First Question']
    const rows = chats.map((chat) => {
      const firstQuestion = chat.messages.find((m) => m.role === 'user')?.content || ''
      return [
        chat.id,
        chat.lawyerType,
        chat.topic || '',
        chat.messages.length.toString(),
        firstQuestion.replace(/\n/g, ' ').substring(0, 100),
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'synthchat-chats.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="py-12">
      <div className="mb-8">
        <h1>SynthChat</h1>
        <p className="mt-4 text-gray-600">
          Generate synthetic chat data and analyze insights for in-house legal
          teams
        </p>
      </div>

      <Card className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold mb-2">Generate Report</h3>
            <p className="text-gray-600">
              Generate 10 privacy lawyer chats and 10 commercial contracts
              lawyer chats, then analyze insights and create an email report.
            </p>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            variant="primary"
            className="min-w-[140px]"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </Card>

      {error && (
        <Card className="mb-8 border-red-200 bg-red-50">
          <p className="text-red-800">Error: {error}</p>
        </Card>
      )}

      {loading && (
        <Card>
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
            <p className="text-gray-600 font-medium mb-2">
              {loadingProgress.message || 'Generating chats and analyzing insights...'}
            </p>
            <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2.5 mb-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: `${(loadingProgress.current / loadingProgress.total) * 100}%`,
                }}
              />
            </div>
            <p className="text-sm text-gray-500">
              {loadingProgress.current} / {loadingProgress.total} chats generated
            </p>
          </div>
        </Card>
      )}

      {insights && (
        <div className="space-y-8">
          <Card id="insights">
            <h2 className="text-2xl font-semibold mb-6">Insights Summary</h2>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">
                  {insights.totalChats}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Total Conversations
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">
                  {insights.timeSavings.totalHours}
                </div>
                <div className="text-sm text-gray-600 mt-2">Hours Saved</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">
                  {insights.topics.length}
                </div>
                <div className="text-sm text-gray-600 mt-2">Topics Covered</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Privacy Lawyers</h3>
                <div className="text-2xl font-bold text-green-600">
                  {insights.timeSavings.privacyLawyer.totalHours} hours
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {insights.timeSavings.privacyLawyer.chatCount} chats • Avg:{' '}
                  {Math.round(
                    insights.timeSavings.privacyLawyer.totalMinutes /
                      insights.timeSavings.privacyLawyer.chatCount
                  )}{' '}
                  min/chat
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Commercial Lawyers</h3>
                <div className="text-2xl font-bold text-green-600">
                  {insights.timeSavings.commercialLawyer.totalHours} hours
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {insights.timeSavings.commercialLawyer.chatCount} chats • Avg:{' '}
                  {Math.round(
                    insights.timeSavings.commercialLawyer.totalMinutes /
                      insights.timeSavings.commercialLawyer.chatCount
                  )}{' '}
                  min/chat
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Top Topics</h3>
              <div className="space-y-3">
                {insights.topics.slice(0, 5).map((topic, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{topic.topic}</span>
                      <span className="text-sm text-gray-600">
                        {topic.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${topic.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {topic.count} conversation{topic.count !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {insights.keyInsights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">
                Top Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                {insights.topFAQs.slice(0, 5).map((faq, index) => (
                  <div key={index} className="border-l-4 border-blue-600 pl-4">
                    <p className="font-medium">{faq.question}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Asked {faq.frequency} time{faq.frequency !== 1 ? 's' : ''}{' '}
                      • {faq.category}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {emailHtml && (
            <Card id="email">
              <h2 className="text-2xl font-semibold mb-4">Email Preview</h2>
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  srcDoc={emailHtml}
                  className="w-full"
                  style={{ height: '800px', border: 'none' }}
                  title="Email Preview"
                />
              </div>
              <div className="mt-4 flex gap-4">
                <Button
                  onClick={() => {
                    const blob = new Blob([emailHtml], { type: 'text/html' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'synthchat-report.html'
                    a.click()
                  }}
                  variant="secondary"
                >
                  Download HTML
                </Button>
              </div>
            </Card>
          )}

          {chats.length > 0 && (
            <Card id="chats">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold">Generated Chats</h2>
                  <p className="text-gray-600 mt-2">
                    View the synthetic chat conversations that were generated and analyzed.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={exportChatsJSON} variant="secondary">
                    Export JSON
                  </Button>
                  <Button onClick={exportChatsCSV} variant="secondary">
                    Export CSV
                  </Button>
                </div>
              </div>

              {['privacy', 'commercial'].map((type) => {
                const typeChats = chats.filter(
                  (chat) => chat.lawyerType === type
                )
                if (typeChats.length === 0) return null

                return (
                  <div key={type} className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 capitalize">
                      {type} Lawyer Chats ({typeChats.length})
                    </h3>
                    <div className="space-y-4">
                      {typeChats.map((chat) => {
                        const isExpanded = expandedChats.has(chat.id)
                        return (
                          <div
                            key={chat.id}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                          >
                            <button
                              onClick={() => {
                                const newExpanded = new Set(expandedChats)
                                if (isExpanded) {
                                  newExpanded.delete(chat.id)
                                } else {
                                  newExpanded.add(chat.id)
                                }
                                setExpandedChats(newExpanded)
                              }}
                              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left flex items-center justify-between transition-colors"
                            >
                              <div className="flex-1">
                                <span className="font-medium text-sm text-gray-700">
                                  Topic: {chat.topic || 'Untitled'}
                                </span>
                                <span className="text-xs text-gray-500 ml-2">
                                  {chat.messages.length} messages
                                </span>
                              </div>
                              <svg
                                className={`w-5 h-5 text-gray-500 transition-transform ${
                                  isExpanded ? 'transform rotate-180' : ''
                                }`}
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M19 9l-7 7-7-7"></path>
                              </svg>
                            </button>

                            {isExpanded && (
                              <div className="p-4 space-y-3 bg-white">
                                {chat.messages.map((msg, idx) => (
                                  <div
                                    key={idx}
                                    className={`${
                                      msg.role === 'user'
                                        ? 'bg-blue-50 border-l-4 border-blue-500'
                                        : 'bg-gray-50 border-l-4 border-gray-400'
                                    } p-3 rounded`}
                                  >
                                    <div className="flex items-center mb-2">
                                      <span
                                        className={`text-xs font-semibold uppercase ${
                                          msg.role === 'user'
                                            ? 'text-blue-700'
                                            : 'text-gray-700'
                                        }`}
                                      >
                                        {msg.role === 'user'
                                          ? 'Lawyer'
                                          : 'GC AI'}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                      {msg.content}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
