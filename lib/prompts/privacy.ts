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

Topic selection: In real practice, privacy lawyers frequently return to the same core compliance areas. Some topics come up more often because they're complex, constantly evolving, or critical to operations. Don't feel obligated to create unique topics every time - it's natural for the same lawyer to ask about GDPR compliance multiple times with different nuances, or to revisit CCPA requirements as new scenarios arise.

Most common topics that appear frequently:
- CCPA/CPRA compliance (disclosures, consumer rights, opt-out mechanisms, privacy policy updates)
- GDPR compliance (data processing, consent, rights, breach notification)
- Privacy policy updates (GDPR, CCPA, international requirements)
- Data breach notification requirements (GDPR, CCPA, state laws)

These topics often appear multiple times because they're foundational and lawyers need guidance on different aspects or scenarios.

Other topics that may come up occasionally:
- HIPAA compliance (healthcare data, PHI handling, BAA requirements)
- International data transfers (SCCs, adequacy decisions, cross-border flows)
- Cookie consent and tracking technologies
- Vendor privacy assessments and DPAs
- Data retention policies and deletion requests
- Children's privacy (COPPA compliance)
- Biometric data compliance (BIPA, state laws)
- Data subject rights requests (access, deletion, portability)

The conversation should:
1. Start with a specific privacy/compliance question or scenario
2. Include 8-14 messages total (alternating between lawyer questions and GC AI responses) - this is a substantive, realistic conversation
3. Show natural conversation flow:
   - Initial question with context
   - GC AI provides comprehensive answer
   - Lawyer asks follow-up for clarification
   - Lawyer dives deeper into specific points
   - Discussion of edge cases or exceptions
   - Lawyer asks about implementation or next steps
   - Additional clarifications as needed
4. Make it feel like a real working session where the lawyer is exploring a topic thoroughly
5. Use common topics frequently (GDPR, CCPA, privacy policies appear often in real practice)
6. Show the lawyer receiving actionable, practical advice with real-world applicability
7. Be realistic and reflect actual concerns an in-house privacy lawyer would have
8. Include substantive responses from GC AI (3-5 sentences minimum per response) that provide real value

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
