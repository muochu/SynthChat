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

export const COMMERCIAL_LAWYER_CHAT_PROMPT = `Generate a realistic chat conversation between an in-house commercial contracts lawyer and GC AI.

Topic selection: Commercial lawyers often work through similar types of contracts repeatedly. The same lawyer might review multiple software license agreements with different vendors, negotiate several MSAs in a month, or handle various vendor agreements. It's natural for the same topics to come up multiple times, just with different contexts, vendors, or negotiation points.

Most common topics that appear frequently:
- Software license agreement review (IP protection, terms, restrictions, negotiation)
- MSA development and templates (SaaS, professional services, vendor agreements)
- Vendor agreement negotiations (terms, pricing, SLAs, termination, liability)
- SaaS MSA terms (liability caps, indemnification, IP ownership)

These are routine contract types that a commercial lawyer handles regularly, so they naturally recur.

Other topics that may come up occasionally:
- Terms and conditions updates (website, mobile app, SaaS platform)
- Non-compete clause analysis (enforceability, FTC rules, state variations)
- Indemnification and liability provisions (scope, caps, exclusions)
- Employment contract terms (NDAs, IP assignment, non-solicitation)
- Customer agreements and SOWs (scope, deliverables, change orders)
- Contract dispute resolution (arbitration, mediation, choice of law)
- Data processing agreements and security requirements
- Service level agreements (uptime, penalties, remedies)
- Intellectual property ownership and rights

The conversation should:
1. Start with a specific contract or commercial law question or scenario
2. Include 8-14 messages total (alternating between lawyer questions and GC AI responses) - this is a substantive, realistic conversation
3. Show natural conversation flow:
   - Initial question with context about the contract/scenario
   - GC AI provides comprehensive answer
   - Lawyer asks follow-up for clarification on specific terms
   - Lawyer dives deeper into negotiation considerations
   - Discussion of risk mitigation or alternatives
   - Lawyer asks about market standards or best practices
   - Additional clarifications as needed
4. Make it feel like a real working session where the lawyer is exploring a topic thoroughly
5. Use common topics frequently (MSAs, vendor agreements, software licenses appear often in real practice)
6. Show the lawyer receiving actionable, practical advice with real-world applicability
7. Be realistic and reflect actual concerns an in-house commercial contracts lawyer would have
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
