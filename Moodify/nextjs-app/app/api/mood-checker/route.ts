import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Check for crisis indicators first
    const crisisKeywords = ['jump', 'suicide', 'don’t want to live', 'self-harm'];
    const isCrisis = crisisKeywords.some(keyword => text.toLowerCase().includes(keyword));

    if (isCrisis) {
      return NextResponse.json({
        mood: 'crisis',
        response: "I’m deeply concerned for your safety, and I’m here to help. Please do not harm yourself. Please contact a helpline immediately: In India, call 9152987821 (AASRA) or 1800-599-0019 (Vandrevala Foundation), or reach out to a trusted person or family member right now. It’s 04:16 PM IST on August 30, 2025—help is available now.",
        emojis: '😔🙏💙',
        hashtags: '#MentalHealthSupport #CrisisHelp'
      });
    }

    const prompt = `Analyze the mood and sentiment of the following text: "${text}"

    Classify the mood as one of these options: happy, sad, angry, excited, neutral, anxious, love, frustrated
    Respond with a structured JSON object containing:
    - "mood": The best single word describing the overall sentiment.
    - "response": A warm, empathetic statement based on the mood (e.g., "I’m glad you’re feeling happy today, and I’m here to celebrate with you." for happy).
    - "emojis": 3-5 relevant emojis matching the mood (e.g., "😊🌟🎉" for happy).
    - "hashtags": 1-2 relevant hashtags (e.g., "#PositiveVibes" for happy, "#AnxietySupport" for anxious).
    Use a professional yet kind tone. Avoid slang or casual language.`

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
    
    // Parse the AI's JSON response
    let result;
    try {
      result = JSON.parse(data.response);
    } catch (e) {
      throw new Error('Invalid response format from Ollama');
    }

    const moodEmojis: { [key: string]: string[] } = {
      'happy': ['😊', '🌟', '🎉'],
      'sad': ['😔', '🌧️', '🙏'],
      'angry': ['😠', '🔥', '💢'],
      'excited': ['🤩', '🎆', '💫'],
      'neutral': ['😐', '🌐', '🤝'],
      'anxious': ['😰', '🌫️', '💡'],
      'love': ['😍', '❤️', '💕'],
      'frustrated': ['😤', '💥', '🌩️']
    };

    const mood = result.mood || 'neutral';
    const emojis = moodEmojis[mood] || moodEmojis['neutral'];
    const responseText = result.response || `I’m here to support you, though I couldn’t fully understand your mood.`;
    const hashtags = result.hashtags || '#MoodSupport';

    return NextResponse.json({
      mood,
      response: responseText,
      emojis: emojis.join(''),
      hashtags
    });
  } catch (error) {
    console.error('Mood Checker API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze mood' },
      { status: 500 }
    );
  }
}