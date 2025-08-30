import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { imageDescription: situation } = await req.json()

    if (!situation) {
      return NextResponse.json(
        { error: 'Situation is required' },
        { status: 400 }
      )
    }

    const prompt = `You are a professional and empathetic virtual friend named Moodify. The user shared this situation: "${situation}"

    Follow these strict rules:
    - If the situation contains words or phrases indicating a mental health crisis (e.g., 'jump,' 'suicide,' 'don’t want to live,' 'self-harm,' or extreme distress), always respond with:
      - First line: "I’m deeply concerned for your safety, and I’m here to help. Please do not harm yourself."
      - Second line: "Please contact a helpline immediately: In India, call 9152987821 (AASRA) or 1800-599-0019 (Vandrevala Foundation), or reach out to a trusted person or family member right now."
      - Third line: 3-5 calming and supportive emojis (e.g., "😔🙏💙").
    - For all other situations:
      - First line: A warm, empathetic statement (e.g., "I’m truly sorry to hear you’re feeling this way, and I’m here to support you.").
      - Next 3-5 lines: Practical, well-thought-out suggestions or solutions, one per line (e.g., "Consider taking a short break to recharge.").
      - Last line: 5-7 relevant and uplifting emojis (e.g., "😊🌱💡❤️✨🎉").
    Use a professional yet kind tone. Avoid slang or casual language. Include hashtags where relevant for context. If unsure, default to the crisis response.`

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3',
        prompt: prompt,
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to get response from Ollama')
    }

    const data = await response.json()
    
    let caption = data.response?.trim() || 'I’m here to support you, though I couldn’t generate a response this time. Please try again or seek help if in crisis.'
    
    return NextResponse.json({ caption })
  } catch (error) {
    console.error('Suggestion API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    )
  }
}