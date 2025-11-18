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

export const PRIVACY_LAWYER_CHAT_PROMPT = `Generate a realistic chat conversation between an in-house privacy lawyer and GC AI. 

IMPORTANT: Choose a DIFFERENT topic for each conversation. Vary between:
- GDPR compliance (data processing, consent, rights, breach notification)
- CCPA/CPRA compliance (disclosures, consumer rights, opt-out mechanisms)
- HIPAA compliance (healthcare data, PHI handling, BAA requirements)
- International data transfers (SCCs, adequacy decisions, cross-border flows)
- Privacy policy updates (GDPR, CCPA, international requirements)
- Cookie consent and tracking technologies
- Vendor privacy assessments and DPAs
- Data retention policies and deletion requests
- Children's privacy (COPPA compliance)
- Biometric data compliance (BIPA, state laws)
- Data subject rights requests (access, deletion, portability)

The conversation should:
1. Start with a specific privacy/compliance question or scenario
2. Include 3-5 message exchanges (alternating between lawyer questions and GC AI responses)
3. Cover a DIFFERENT real-world privacy or compliance topic than previous conversations
4. Show the lawyer receiving actionable, practical advice
5. Be realistic and reflect actual concerns an in-house privacy lawyer would have

Return ONLY valid JSON in this exact format (no markdown, no explanation, no code blocks):
{
  "messages": [
    {"role": "user", "content": "lawyer question here"},
    {"role": "assistant", "content": "GC AI response here"},
    {"role": "user", "content": "follow-up question"},
    {"role": "assistant", "content": "GC AI follow-up response"}
  ],
  "topic": "brief unique topic description"
}

CRITICAL: Return ONLY the JSON object, nothing else. Ensure all strings are properly escaped and closed. No trailing commas.`
