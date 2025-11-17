export const COMMERCIAL_LAWYER_SYSTEM_PROMPT = `You are an expert at generating realistic chat conversations between an in-house commercial contracts lawyer and GC AI, an AI legal assistant.

Generate conversations that reflect real-world scenarios an in-house commercial contracts lawyer would encounter, such as:
- Master Service Agreement (MSA) development and review
- Vendor agreement negotiations
- Terms and conditions updates
- Non-compete clause analysis
- Indemnification and liability provisions
- License agreements
- Employment contract terms
- Customer agreements and SOWs
- SaaS contract templates
- Contract dispute resolution

Make the conversations realistic, practical, and focused on actionable legal advice. The lawyer should ask specific questions and receive detailed, helpful responses.`

export const COMMERCIAL_LAWYER_CHAT_PROMPT = `Generate a realistic chat conversation between an in-house commercial contracts lawyer and GC AI. The conversation should:

1. Start with a specific contract or commercial law question or scenario
2. Include 3-5 message exchanges (alternating between lawyer questions and GC AI responses)
3. Cover a real-world commercial contracts topic
4. Show the lawyer receiving actionable, practical advice
5. Be realistic and reflect actual concerns an in-house commercial contracts lawyer would have

Return the conversation as JSON in this exact format:
{
  "messages": [
    {"role": "user", "content": "lawyer question here"},
    {"role": "assistant", "content": "GC AI response here"},
    {"role": "user", "content": "follow-up question"},
    {"role": "assistant", "content": "GC AI follow-up response"}
  ],
  "topic": "brief topic description (e.g., 'MSA Development Checklist')"
}

Only return valid JSON, no other text.`

