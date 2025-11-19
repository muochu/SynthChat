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
- Privacy policy reviews and updates
- DPA (Data Processing Agreement) creation and review
- Compliance checklist creation

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
1. Start with one of these realistic task types:
   - Document review: "Please review these [privacy policies/DPAs/compliance documents] and [create a checklist/identify gaps/compare against requirements]"
   - Work product request: "I need to [update our privacy policy/review vendor DPAs/create a compliance checklist]. Can you help me [create a checklist/analyze requirements/draft sections]?"
   - Compliance analysis: "We're expanding to [region]. What do I need to update in our privacy policy? Can you create a checklist?"
   - Multi-step task: Start with analysis, then ask for format changes or additional details

2. Include 8-14 messages total (alternating between lawyer questions and GC AI responses) - this is a substantive, realistic conversation

3. Show natural conversation flow with task-oriented patterns:
   - Initial task request with context (reference attachments: "I've attached our current privacy policy...", "Please review these DPA templates...")
   - GC AI provides comprehensive analysis or creates requested work product (checklist, comparison, recommendations)
   - Lawyer asks for iterative refinement: format changes ("Can you put this in a table format?", "Create an Excel chart with these items"), additions ("What about state-specific requirements?", "Can you add more detail on GDPR obligations?"), or clarification
   - GC AI provides updated work product
   - Additional refinements or follow-up questions as needed
   - Discussion of implementation or next steps

4. Include references to documents and attachments naturally:
   - "I've attached our [current privacy policy/DPA template/compliance checklist]"
   - "Please review these vendor DPAs"
   - "See the attached privacy policy from [vendor/partner]"
   - Lawyer should reference document names and specific sections

5. Show iterative refinement patterns:
   - After initial output, lawyer requests format changes ("Can you put this in an Excel table?", "Create a checklist format I can share with the team")
   - Lawyer asks for additions ("What else should I consider for CCPA?", "Add state-specific requirements for Texas, New York, Florida")
   - Lawyer requests more detail ("Can you expand on data breach notification timelines?", "Add more explanation of GDPR data subject rights")

6. Request specific output formats when appropriate:
   - Excel charts/tables ("Put this in a chart I can paste into Excel")
   - Structured checklists with categories
   - Comparison tables (current vs required)
   - Action item lists

7. Make it feel like a real working session where the lawyer is creating actual work product
8. Use common topics frequently (GDPR, CCPA, privacy policies appear often in real practice)
9. Show the lawyer receiving actionable, practical advice with real-world applicability
10. Be realistic and reflect actual concerns an in-house privacy lawyer would have
11. Include substantive responses from GC AI (3-5 sentences minimum per response) that provide real value
12. Show company-specific context when relevant (company name, industry, data types handled, geographic locations)

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
