import Groq from 'groq-sdk'
import { config } from './config'
import e from 'cors'

const groq = new Groq({
  apiKey: config.groqKey,
  dangerouslyAllowBrowser: true,
})
export const extractJobDetails = async (jobDescription) => {
  const completion = await groq.chat.completions.create({
   model: 'llama-3.1-8b-instant',
temperature: 0,
messages: [
      {
        role: 'user',
        content: `Read this job description and extract the following information. Return ONLY a JSON object, nothing else, no extra text, no markdown. { "company": "company name here", "role": "job title here", "requirements": "top 3 requirements as one short sentence" } Job description: ${jobDescription}`
      }
    ],
    max_tokens: 200
  })

  const text = completion.choices[0].message.content.trim()
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}
export const extractSkills = async (text, type) => {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    temperature: 0,
    messages: [
      {
        role: 'user',
        content: `Extract all technical skills, technologies, programming languages, frameworks, databases, and tools from this ${type}. Return ONLY a JSON array of lowercase strings, nothing else. Example: ["react", "node.js", "python", "aws"]. ${type}: ${text.slice(0, 2500)}`
      }
    ],
    max_tokens: 400
  })

  let result = completion.choices[0].message.content.trim()
  result = result.replace(/```json|```/g, '').trim()
  
  // Find the JSON array within the response
  const start = result.indexOf('[')
  const end = result.lastIndexOf(']')
  
  if (start === -1 || end === -1) {
    return []
  }
  
  const jsonString = result.slice(start, end + 1)
  
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('Failed to parse skills:', error)
    return []
  }
}
export const generateSuggestions = async (resumeText, missingSkills) => {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    temperature: 0,
    messages: [
      {
        role: 'user',
        content: `A job seeker is missing these skills: ${missingSkills.join(', ')}. Write 3 professional resume bullet points they could add if they have experience with these skills. Each should start with an action verb. Return ONLY a JSON array of 3 strings. Example: ["Developed scalable APIs using Node.js", "Deployed applications on AWS using Docker"]`
      }
    ],
    max_tokens: 400
  })

  let result = completion.choices[0].message.content.trim()
  result = result.replace(/```json|```/g, '').trim()
  const start = result.indexOf('[')
  const end = result.lastIndexOf(']')
  if (start === -1 || end === -1) return []
  try {
    return JSON.parse(result.slice(start, end + 1))
  } catch {
    return []
  }
}
