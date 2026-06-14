import Groq from 'groq-sdk'
import { config } from './config'

const groq = new Groq({ 
  apiKey: config.groqKey,
  dangerouslyAllowBrowser: true 
})

export const extractJobDetails = async (jobDescription) => {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'user',
        content: `Read this job description and extract the following information.
Return ONLY a JSON object, nothing else, no extra text, no markdown.

{
  "company": "company name here",
  "role": "job title here",
  "requirements": "top 3 requirements as one short sentence"
}

Job description:
${jobDescription}`
      }
    ],
    max_tokens: 200
  })

  const text = completion.choices[0].message.content.trim()
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}