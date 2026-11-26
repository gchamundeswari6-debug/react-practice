require('dotenv').config()

const express = require('express')
const cors = require('cors')
const { GoogleGenAI } = require('@google/genai')

const app = express()

app.use(cors())
app.use(express.json())

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
})

app.get('/', (req, res) => {
    res.send('Backend server is running!')
})

app.post('/summarize', async (req, res) => {
    try {
        const text = req.body.text

        const sentences = text.trim()
            .split(/(?<=[.!?])\s+|\n+/)
            .filter(sentence => sentence.trim())

        if (sentences.length <= 1) {
            console.log('Original text returned:', text.trim())

            return res.json({
                summary: text.trim()
            })
        }
        console.log('Gemini API is calling...')
        const interaction = await ai.interactions.create({
            // model: 'gemini-3.8-flash',
            model: 'gemini-3.5-flash-lite',
            // input: `Summarize the following text in simple English:\n\n${text}`
            input: `You are a helpful text summarization assistant.

Follow these rules:
1. Summarize the text in simple English.
2. Combine related sentences into a shorter paragraph.
3. Keep all important information.
4. Do not change the original meaning.
5. Do not add new information.
6. Avoid repeating the same information.
7. Reduce the text length by at least 40% when possible.
8. Do not return the original sentences word for word.
9. Combine related points into a concise paragraph.
Text:
${text}`
        })
        console.log('Gemini Response:', interaction.output_text)

        res.json({
            summary: interaction.output_text
        })

    } catch (error) {
        console.error('Gemini API Error:', error)

        res.status(500).json({
            error: 'Failed to generate summary'
        })
    }
})

app.listen(5000, () => {
    console.log('Server running on port 5000')
})