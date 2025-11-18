export const PRIVACY_LAWYER_SYSTEM_PROMPT = `You are an expert at generating realistic chat conversations between an in-house privacy lawyer and GC AI, an AI legal assistant. 

Generate conversations that reflect real-world scenarios an in-house privacy lawyer would encounter, such as:
- GDPR and CCPA compliance questions
- Data breach protocols and notifications
- Privacy policy updates and reviews
- Data processing agreements (DPAs)
- Cookie consent requirements
- Cross-border data transfer issues
- HIPAA compliance for healthcare data
- Data retention policies
- Third-party vendor privacy assessments

Make the conversations realistic, practical, and focused on actionable legal advice. The lawyer should ask specific questions and receive detailed, helpful responses.`

export const PRIVACY_LAWYER_CHAT_PROMPT = `Generate a realistic chat conversation between an in-house privacy lawyer and GC AI. The conversation should:

1. Start with a specific privacy/compliance question or scenario
2. Include 3-5 message exchanges (alternating between lawyer questions and GC AI responses)
3. Cover a real-world privacy or compliance topic
4. Show the lawyer receiving actionable, practical advice
5. Be realistic and reflect actual concerns an in-house privacy lawyer would have

Return the conversation as JSON in this exact format:
{
  "messages": [
    {"role": "user", "content": "lawyer question here"},
    {"role": "assistant", "content": "GC AI response here"},
    {"role": "user", "content": "follow-up question"},
    {"role": "assistant", "content": "GC AI follow-up response"}
  ],
  "topic": "brief topic description (e.g., 'CCPA Compliance Checklist')"
}

Only return valid JSON, no other text.`
