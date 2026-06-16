import Groq from 'groq-sdk'

const groq = new Groq({ 
  apiKey: import.meta.env.VITE_GROQ_KEY,
  dangerouslyAllowBrowser: true 
})
export const extractJobDetails = async (jobDescription) => {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
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

export const analyzeResume = async (resumeText, jobDescription) => {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'user',
        content: `You are an expert ATS and technical recruiter. Analyze the resume against the job description. Return ONLY a JSON object, nothing else, no extra text, no markdown. { "atsScore": 0, "matchedSkills": [], "missingSkills": [], "missingKeywords": [], "experienceGaps": [], "resumeSuggestions": [], "rewrittenBullets": [], "interviewProbability": "" } Resume: ${resumeText.slice(0, 2000)} Job Description: ${jobDescription.slice(0, 1000)}`
      }
    ],
    max_tokens: 800
  })

  const text = completion.choices[0].message.content.trim()
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}