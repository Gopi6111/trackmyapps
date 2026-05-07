import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI('AIzaSyCSShz7_M2apBeTN641Yg9der-QahL_Qm4')
export const extractJobDetails = async (jobDescription) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const prompt = `
    Read this job description and extract the following information.
    Return ONLY a JSON object, nothing else, no extra text.

    {
      "company": "company name here",
      "role": "job title here",
      "requirements": "top 3 requirements as one short sentence"
    }

    Job description:
    ${jobDescription}
  `

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  const clean = text.replace(/```json|```/g, '').trim()
  return JSON.parse(clean)
}