'use client'

import { useState, useRef, useEffect } from 'react'
import Button from '@/components/button'
import Card from '@/components/card'
import LawyerTypeCard from '@/components/lawyerTypeCard'
import { ChatInsights } from '@/types/insights'
import { Chat } from '@/types/chat'
import { normalizeTopic } from '@/lib/analysis/chatAnalyzer'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState({
    current: 0,
    total: 20,
    message: '',
  })
  const [insights, setInsights] = useState<ChatInsights | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [emailHtml, setEmailHtml] = useState<string | null>(null)
  const [emailPdf, setEmailPdf] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedChats, setExpandedChats] = useState<Set<string>>(new Set())
  const [showChats, setShowChats] = useState(false)
  const [showEmailPreview, setShowEmailPreview] = useState(false)
  const [chatSearchQuery, setChatSearchQuery] = useState('')
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success'
  ) => {
    setToast({ message, type })
  }

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setLoading(false)
      setError(null)
      setToast({ message: 'Generation cancelled', type: 'error' })
    }
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setInsights(null)
    setChats([])
    setEmailHtml(null)
    setEmailPdf(null)
    setExpandedChats(new Set())
    setLoadingProgress({
      current: 0,
      total: 20,
      message: 'Starting generation...',
    })

    // Simulate progress updates
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev.current >= prev.total) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current)
          }
          return prev
        }
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

    // Create abort controller for request cancellation
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/generate-and-analyze', {
        method: 'POST',
        signal: abortControllerRef.current.signal,
      })

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      setLoadingProgress({
        current: 20,
        total: 20,
        message: 'Analyzing insights...',
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg =
          data.details || data.error || 'Failed to generate chats and insights'
        throw new Error(errorMsg)
      }

      setInsights(data.insights)
      setChats(data.chats || [])
      setLoadingProgress({
        current: 20,
        total: 20,
        message: 'Generating email...',
      })

      const emailResponse = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insights: data.insights }),
      })

      if (emailResponse.ok) {
        const emailData = await emailResponse.json()
        setEmailHtml(emailData.html)
        setEmailPdf(emailData.pdf || null)
        showToast('Report generated successfully!')
      } else {
        const errorData = await emailResponse.json()
        console.error('Email generation error:', errorData)
      }
    } catch (err) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message)
      } else if (err instanceof Error) {
        setError('Request was cancelled')
      } else {
        setError('An error occurred')
      }
    } finally {
      setLoading(false)
      setLoadingProgress({ current: 0, total: 20, message: '' })
      abortControllerRef.current = null
    }
  }

  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string
  ) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportChatsJSON = () => {
    if (chats.length === 0) return
    downloadFile(
      JSON.stringify(chats, null, 2),
      'synthchat-chats.json',
      'application/json'
    )
    showToast('Chats exported as JSON')
  }

  const exportChatsCSV = () => {
    if (chats.length === 0) return
    const headers = [
      'ID',
      'Lawyer Type',
      'Topic',
      'Message Count',
      'First Question',
    ]
    const rows = chats.map(chat => {
      const firstQuestion =
        chat.messages.find(m => m.role === 'user')?.content || ''
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
      ...rows.map(row =>
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')
    downloadFile(csvContent, 'synthchat-chats.csv', 'text/csv')
    showToast('Chats exported as CSV')
  }

  const handleDownloadReport = () => {
    if (!emailPdf) return
    const binaryString = atob(emailPdf)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    const blob = new Blob([bytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'synthchat-report.pdf'
    a.click()
    URL.revokeObjectURL(url)
    showToast('Report downloaded successfully!')
  }

  const toggleChatExpansion = (chatId: string) => {
    setExpandedChats(prev => {
      const newSet = new Set(prev)
      if (newSet.has(chatId)) {
        newSet.delete(chatId)
      } else {
        newSet.add(chatId)
      }
      return newSet
    })
  }

  const filterChats = (chats: Chat[], query: string) => {
    if (!query) return chats
    const q = query.toLowerCase()
    return chats.filter(
      chat =>
        chat.topic?.toLowerCase().includes(q) ||
        chat.messages.some(msg => msg.content.toLowerCase().includes(q))
    )
  }

  const privacyChats = chats.filter(chat => chat.lawyerType === 'privacy')
  const commercialChats = chats.filter(chat => chat.lawyerType === 'commercial')
  const filteredPrivacyChats = filterChats(privacyChats, chatSearchQuery)
  const filteredCommercialChats = filterChats(commercialChats, chatSearchQuery)

  const scrollToChats = () => {
    const element = document.getElementById('chats')
    if (element) {
      setShowChats(true)
      const navHeight = 64
      const offsetPosition =
        element.getBoundingClientRect().top + window.pageYOffset - navHeight
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
    }
  }

  const scrollToTopicChats = (topicName: string) => {
    setShowChats(true)
    scrollToChats()
    setTimeout(() => {
      const searchTerms = topicName
        .toLowerCase()
        .replace(/[\/&]/g, ' ')
        .split(/\s+/)
        .filter(term => term.length > 2)
        .slice(0, 3)
      setChatSearchQuery(
        searchTerms[0] || topicName.toLowerCase().split(' ')[0]
      )
    }, 600)
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
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-red-800 font-medium mb-1">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <Button
              onClick={() => {
                setError(null)
                handleGenerate()
              }}
              variant="secondary"
              className="text-sm ml-4"
            >
              Retry
            </Button>
          </div>
        </Card>
      )}

      {loading && (
        <Card>
          <div
            className="text-center py-8"
            role="status"
            aria-live="polite"
            aria-label="Loading report"
          >
            <div
              className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"
              aria-hidden="true"
            ></div>
            <p className="text-gray-600 font-medium mb-2">
              {loadingProgress.message ||
                'Generating chats and analyzing insights...'}
            </p>
            <div
              className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2.5 mb-2"
              role="progressbar"
              aria-valuenow={loadingProgress.current}
              aria-valuemin={0}
              aria-valuemax={loadingProgress.total}
            >
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: `${(loadingProgress.current / loadingProgress.total) * 100}%`,
                }}
              />
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {loadingProgress.current} / {loadingProgress.total} chats
              generated
            </p>
            <Button
              onClick={handleCancel}
              variant="secondary"
              className="text-sm"
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
          role="alert"
        >
          {toast.message}
        </div>
      )}

      {insights && (
        <div className="space-y-6">
          <Card id="insights">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Insights Report
              </h2>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowEmailPreview(!showEmailPreview)}
                  variant="secondary"
                  className="text-sm"
                  disabled={!emailHtml}
                  aria-label={
                    showEmailPreview
                      ? 'Hide email preview'
                      : 'Show email preview'
                  }
                >
                  {showEmailPreview ? 'Hide Email Preview' : 'Preview Email'}
                </Button>
                <Button
                  onClick={handleDownloadReport}
                  variant="secondary"
                  className="text-sm"
                  disabled={!emailPdf}
                  aria-label="Download insights report as PDF"
                >
                  Download PDF Report
                </Button>
              </div>
            </div>

            {showEmailPreview && emailHtml && (
              <div className="mb-8 border-t border-gray-200 pt-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Email Preview (React-Email)
                  </h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Generated with @react-email/components
                  </span>
                </div>
                <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                  <div className="bg-white max-w-2xl mx-auto overflow-auto max-h-[800px]">
                    <iframe
                      srcDoc={emailHtml}
                      className="w-full border-0 min-h-[600px]"
                      title="Email preview"
                      sandbox="allow-same-origin allow-scripts"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                <div className="text-4xl font-bold text-blue-600 mb-1">
                  {insights.totalChats}
                </div>
                <div className="text-sm font-medium text-blue-900">
                  Conversations
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                <div className="text-4xl font-bold text-green-600 mb-1">
                  {insights.timeSavings.totalHours}
                </div>
                <div className="text-sm font-medium text-green-900">
                  Hours Saved
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                <div className="text-4xl font-bold text-purple-600 mb-1">
                  {insights.topics.length}
                </div>
                <div className="text-sm font-medium text-purple-900">
                  Topics Covered
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <LawyerTypeCard
                title="Privacy Lawyers"
                totalHours={insights.timeSavings.privacyLawyer.totalHours}
                totalMinutes={insights.timeSavings.privacyLawyer.totalMinutes}
                chatCount={insights.timeSavings.privacyLawyer.chatCount}
                colorScheme="blue"
              />
              <LawyerTypeCard
                title="Commercial Lawyers"
                totalHours={insights.timeSavings.commercialLawyer.totalHours}
                totalMinutes={
                  insights.timeSavings.commercialLawyer.totalMinutes
                }
                chatCount={insights.timeSavings.commercialLawyer.chatCount}
                colorScheme="green"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4 text-gray-900">
                  Top Topics
                </h3>
                <div className="space-y-3">
                  {insights.topics
                    .slice(0, insights.topFAQs.length > 0 ? 3 : 6)
                    .map(topic => (
                      <button
                        key={`${topic.topic}-${topic.count}`}
                        onClick={() => scrollToTopicChats(topic.topic)}
                        className="w-full text-left bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-sm text-gray-900 flex-1 pr-3 leading-snug">
                            {topic.topic}
                          </span>
                          <span className="text-sm font-bold text-gray-700 bg-gray-50 px-2.5 py-1 rounded whitespace-nowrap">
                            {topic.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1.5">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${topic.percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          {topic.count} conversation
                          {topic.count !== 1 ? 's' : ''} • Click to view
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {insights.topFAQs.length > 0 ? (
                <div>
                  <h3 className="text-lg font-bold mb-4 text-gray-900">
                    Top FAQs
                  </h3>
                  <div className="space-y-3">
                    {insights.topFAQs.slice(0, 3).map(faq => (
                      <div
                        key={`${faq.question.substring(0, 50)}-${faq.category}`}
                        className="bg-white p-4 rounded-lg border-l-4 border-blue-500 border-gray-200 hover:border-blue-600 transition-colors"
                      >
                        <p className="font-medium text-sm text-gray-900 mb-2 line-clamp-2 leading-snug">
                          {faq.question}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                            {faq.frequency}x
                          </span>
                          <span className="text-xs text-gray-500 capitalize">
                            {faq.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-bold mb-4 text-gray-900">
                    Key Insights
                  </h3>
                  <div className="space-y-3">
                    {insights.keyInsights.slice(0, 5).map((insight, index) => (
                      <div
                        key={`insight-${index}`}
                        className="bg-white p-4 rounded-lg border-l-4 border-green-500 border-gray-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                            <span className="text-green-600 text-xs font-bold">
                              {index + 1}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 leading-relaxed">
                            {insight}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {chats.length > 0 && (
            <Card id="chats">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Generated Chats
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {chats.length} conversations • Toggle to view details
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setShowChats(!showChats)}
                    variant="secondary"
                    className="text-sm"
                  >
                    {showChats ? 'Hide Chats' : 'Show Chats'}
                  </Button>
                  <div className="flex gap-1">
                    <Button
                      onClick={exportChatsJSON}
                      variant="secondary"
                      className="text-xs px-2 py-1"
                      disabled={chats.length === 0}
                      aria-label="Export chats as JSON"
                    >
                      JSON
                    </Button>
                    <Button
                      onClick={exportChatsCSV}
                      variant="secondary"
                      className="text-xs px-2 py-1"
                      disabled={chats.length === 0}
                      aria-label="Export chats as CSV"
                    >
                      CSV
                    </Button>
                  </div>
                </div>
              </div>

              {showChats && (
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search chats by topic or content..."
                    value={chatSearchQuery}
                    onChange={e => setChatSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {chatSearchQuery && (
                    <p className="text-xs text-gray-500 mt-1">
                      Found{' '}
                      {filteredPrivacyChats.length +
                        filteredCommercialChats.length}{' '}
                      matching conversations
                    </p>
                  )}
                </div>
              )}

              {showChats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                  {[
                    { type: 'privacy', chats: filteredPrivacyChats },
                    { type: 'commercial', chats: filteredCommercialChats },
                  ].map(({ type, chats: typeChats }) => {
                    if (typeChats.length === 0) return null

                    const isPrivacy = type === 'privacy'

                    return (
                      <div key={type}>
                        <div
                          className={`${isPrivacy ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'} border rounded-lg p-3 mb-3`}
                        >
                          <h3
                            className={`text-base font-bold ${isPrivacy ? 'text-blue-900' : 'text-green-900'} capitalize`}
                          >
                            {type} Lawyer Chats
                          </h3>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {typeChats.length} conversations
                          </p>
                        </div>
                        <div className="space-y-2">
                          {typeChats.map(chat => {
                            const isExpanded = expandedChats.has(chat.id)
                            return (
                              <div
                                key={chat.id}
                                className={`border rounded-lg overflow-hidden transition-all ${
                                  isExpanded
                                    ? isPrivacy
                                      ? 'border-blue-400 shadow-sm'
                                      : 'border-green-400 shadow-sm'
                                    : 'border-gray-200'
                                }`}
                              >
                                <button
                                  onClick={() => toggleChatExpansion(chat.id)}
                                  className="w-full px-3 py-2.5 bg-gray-50 hover:bg-gray-100 text-left flex items-center justify-between transition-colors"
                                  aria-expanded={isExpanded}
                                  aria-label={`${isExpanded ? 'Collapse' : 'Expand'} chat: ${chat.topic || 'Untitled'}`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-gray-900 truncate mb-1">
                                      {chat.topic || 'Untitled'}
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span
                                        className={`text-xs px-2 py-0.5 rounded font-medium ${
                                          isPrivacy
                                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                            : 'bg-green-100 text-green-700 border border-green-200'
                                        }`}
                                      >
                                        {normalizeTopic(chat.topic || '')}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {chat.messages.length} msgs
                                      </span>
                                      <span
                                        className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                          isPrivacy
                                            ? 'bg-blue-50 text-blue-900'
                                            : 'bg-green-50 text-green-900'
                                        }`}
                                      >
                                        {type}
                                      </span>
                                    </div>
                                  </div>
                                  <svg
                                    className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ml-2 ${
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
                                  <div className="p-3 space-y-2 bg-white max-h-80 overflow-y-auto">
                                    {chat.messages.map((msg, idx) => (
                                      <div
                                        key={idx}
                                        className={`${
                                          msg.role === 'user'
                                            ? isPrivacy
                                              ? 'bg-blue-50 border-l-3 border-blue-400'
                                              : 'bg-green-50 border-l-3 border-green-400'
                                            : 'bg-gray-50 border-l-3 border-gray-300'
                                        } p-2.5 rounded text-sm`}
                                      >
                                        <div className="flex items-center mb-1.5">
                                          <span
                                            className={`text-xs font-bold uppercase ${
                                              msg.role === 'user'
                                                ? isPrivacy
                                                  ? 'text-blue-700'
                                                  : 'text-green-700'
                                                : 'text-gray-600'
                                            }`}
                                          >
                                            {msg.role === 'user'
                                              ? 'Lawyer'
                                              : 'GC AI'}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
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
                </div>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
