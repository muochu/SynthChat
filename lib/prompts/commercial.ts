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
- Employee handbook updates and compliance reviews
- Purchase order terms and conditions review
- Contract template creation and comparison

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
1. Start with one of these realistic task types:
   - Document review: "Please review these attached [documents/templates/purchase order terms] and [create a checklist/compare sections/identify gaps/explain why we can't accept]"
   - Work product request: "I need to [create an MSA/update employee handbook/review vendor agreement]. Can you help me [create a checklist/analyze provisions/compare terms/draft a response]?"
   - Multi-step task: Start with document review, then ask for format changes or additional details

2. Include 8-14 messages total (alternating between lawyer questions and GC AI responses) - this is a substantive, realistic conversation

3. Show natural conversation flow with task-oriented patterns:
   - Initial task request with context (reference attachments: "I've attached...", "Please review these documents...")
   - GC AI provides comprehensive analysis or creates requested work product (checklist, comparison, explanation)
   - Lawyer asks for iterative refinement: format changes ("Can you put this in a chart for Excel?", "Instead of a list, can you make a table?"), additions ("Can you add more detail on...", "What else should I consider?"), or clarification
   - GC AI provides updated work product
   - Additional refinements or follow-up questions as needed
   - Discussion of implementation or next steps

4. Include references to documents and attachments naturally:
   - "I've attached [document names]"
   - "Please review these templates"
   - "See the attached purchase order terms"
   - Lawyer should reference document names and specific sections

5. Show iterative refinement patterns:
   - After initial output, lawyer requests format changes ("Can you put this in an Excel chart format?", "Create a table with columns: X, Y, Z")
   - Lawyer asks for additions ("Can you add state-specific requirements?", "Include a column for why we want this edit")
   - Lawyer requests more detail ("Can you expand on the indemnification section?", "Add more explanation of how to broaden this provision")

6. Request specific output formats when appropriate:
   - Excel charts/tables ("Put this in a chart I can paste into Excel")
   - Structured lists with columns ("Include section, description, benefit, and adjustments")
   - Checklists with bullet points
   - Comparison tables

7. Make it feel like a real working session where the lawyer is creating actual work product
8. Use common topics frequently (MSAs, vendor agreements, employee handbooks appear often in real practice)
9. Show the lawyer receiving actionable, practical advice with real-world applicability
10. Include substantive responses from GC AI (3-5 sentences minimum per response) that provide real value
11. Show company-specific context when relevant (company name, industry, employee count, locations)

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
