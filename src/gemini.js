import Groq from 'groq-sdk'
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

  let text = completion.choices[0].message.content.trim()
  text = text.replace(/```json|```/g, '').trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) return { company: '', role: '', requirements: '' }
  try {
    return JSON.parse(text.slice(start, end + 1))
  } catch {
    return { company: '', role: '', requirements: '' }
  }
}
export const analyzeResumeVsJD = async (resumeText, jobDescription) => {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    temperature: 0,
    messages: [
      {
        role: 'user',
        content: `You are an ATS expert. Compare this resume against the job description. Return ONLY a valid JSON object with these exact keys, no markdown, no extra text:
{
  "resumeSkills": ["list", "of", "skills", "in", "resume"],
  "jdSkills": ["list", "of", "skills", "required", "by", "job"],
  "experienceGaps": ["specific gap 1", "specific gap 2"],
  "rewrittenBullets": ["improved bullet 1", "improved bullet 2", "improved bullet 3"],
  "suggestions": ["actionable tip 1", "actionable tip 2"]
}
All skills must be lowercase. experienceGaps should describe missing experience or qualifications. rewrittenBullets should be stronger ATS-friendly versions of resume bullets. 

Resume: ${resumeText.slice(0, 2000)}

Job Description: ${jobDescription.slice(0, 1200)}`
      }
    ],
    max_tokens: 900
  })

  let result = completion.choices[0].message.content.trim()
  result = result.replace(/```json|```/g, '').trim()
  const start = result.indexOf('{')
  const end = result.lastIndexOf('}')
  if (start === -1 || end === -1) {
    return { resumeSkills: [], jdSkills: [], experienceGaps: [], rewrittenBullets: [], suggestions: [] }
  }
  try {
    return JSON.parse(result.slice(start, end + 1))
  } catch {
    return { resumeSkills: [], jdSkills: [], experienceGaps: [], rewrittenBullets: [], suggestions: [] }
  }
}