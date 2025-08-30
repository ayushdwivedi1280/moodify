'use client'

import { useState } from 'react'

interface SuggestionResult {
  response: string
  suggestions: string[]
  emojis: string
}

export default function Moodify() {
  const [loading, setLoading] = useState(false)
  const [situation, setSituation] = useState('')
  const [result, setResult] = useState<SuggestionResult | null>(null)
  const [copied, setCopied] = useState(false)

  const getSuggestions = async () => {
    if (!situation.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/caption-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDescription: situation })  // Reusing the old field name, but it's now situation
      })
      
      const data = await response.json()
      if (data.caption) {
        // Parse the AI response (assuming it's formatted)
        const lines = data.caption.split('\n')
        const empatheticResponse = lines[0] || ''
        const suggestions = lines.slice(1, -1) || []
        const emojis = lines[lines.length - 1] || ''
        setResult({
          response: empatheticResponse,
          suggestions,
          emojis
        })
      }
    } catch (error) {
      console.error('Error getting suggestions:', error)
    }
    setLoading(false)
  }

  const copyToClipboard = async () => {
    if (!result) return
    const text = `${result.response}\n${result.suggestions.join('\n')}\n${result.emojis}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">🤗 Moodify</h1>
          <p className="text-white/80 text-lg">Your AI Virtual Friend - Share your situation and get empathetic suggestions!</p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <div className="social-card rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Tell Me What's Going On</h2>
            <p className="text-white/80 mb-6">Describe your situation, feelings, or problem – I'll listen and help like a friend.</p>
            
            <div className="space-y-4">
              <textarea
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="e.g., 'I'm feeling stressed about my upcoming exam and don't know how to prepare...'"
                className="w-full h-32 p-4 rounded-lg border-0 bg-white/20 text-white placeholder-white/60 focus:ring-2 focus:ring-white/30 resize-none"
              />
              
              <button
                onClick={getSuggestions}
                disabled={loading || !situation.trim()}
                className="w-full px-6 py-3 social-gradient text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
              >
                {loading ? 'Thinking...' : 'Get Suggestions 🤝'}
              </button>

              {result && (
                <div className="bg-white/20 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-white">I Hear You:</h3>
                  <p className="text-white/90 text-lg leading-relaxed">{result.response}</p>
                  
                  <h3 className="font-semibold text-white">Suggestions & Solutions:</h3>
                  <ul className="list-disc pl-5 text-white/90">
                    {result.suggestions.map((sug, i) => (
                      <li key={i}>{sug}</li>
                    ))}
                  </ul>
                  
                  <h3 className="font-semibold text-white">Emojis for Your Mood:</h3>
                  <p className="text-3xl">{result.emojis}</p>
                  
                  <button
                    onClick={copyToClipboard}
                    className={`copy-button px-4 py-2 rounded-lg font-medium ${copied ? 'copied' : 'bg-white/20 hover:bg-white/30 text-white'}`}
                  >
                    {copied ? 'Copied! ✓' : 'Copy Response 📋'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}