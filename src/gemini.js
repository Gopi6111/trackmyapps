import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_KEY,
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
    model: 'llama-3.3-70b-versatile',
    temperature: 0,
    messages: [
      {
        role: 'user',
        content: `You are an ATS evaluator. Analyze the resume against the job description using semantic understanding (match related concepts, not just exact words). Score each component from 0 to 100.

Return ONLY valid JSON, no markdown:
{
  "skill_match": <0-100: how well hard skills match>,
  "concept_match": <0-100: how well related concepts/domains match semantically>,
  "experience_match": <0-100: does experience level meet requirements>,
  "tools_match": <0-100: how well specific tools/technologies match>,
  "matched_skills": ["skills found in both"],
  "missing_skills": ["important skills missing"],
  "experience_summary": "brief note on years of experience vs required",
  "improvement_suggestions": ["2-3 tips"],
  "rewritten_bullets": ["3 improved resume bullets"]
}

Resume: ${resumeText.slice(0, 3000)}

Job Description: ${jobDescription.slice(0, 1500)}`
      }
    ],
    max_tokens: 1500
  })

  let result = completion.choices[0].message.content.trim()
  result = result.replace(/```json|```/g, '').trim()
  const start = result.indexOf('{')
  const end = result.lastIndexOf('}')
  if (start === -1 || end === -1) {
    return { skill_match: 0, concept_match: 0, experience_match: 0, tools_match: 0, matched_skills: [], missing_skills: [], experience_summary: '', improvement_suggestions: [], rewritten_bullets: [] }
  }
  try {
    return JSON.parse(result.slice(start, end + 1))
  } catch {
    return { skill_match: 0, concept_match: 0, experience_match: 0, tools_match: 0, matched_skills: [], missing_skills: [], experience_summary: '', improvement_suggestions: [], rewritten_bullets: [] }
  }
}