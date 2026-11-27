require('dotenv').config()

const express = require('express')
const cors = require('cors')
const { GoogleGenAI } = require('@google/genai')

const app = express()

const allowedOrigins = [
    'http://localhost:5173',
    process.env.FRONTEND_URL
]

app.use(cors({
    origin: allowedOrigins
}))
app.use(express.json({ limit: '10kb' }))

if (!process.env.GEMINI_API_KEY) {
// if (true) {
    console.error('Gemini API key is missing!')
    process.exit(1)
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
})

app.get('/', (req, res) => {
    res.send('Backend server is running!')
})

app.post('/summarize', async (req, res) => {
    try {
        if (typeof req.body.text !== 'string') {
            return res.status(400).json({
                error: 'Invalid text input. Please send text as a string.'
            })
        }

        const text = req.body.text
        if (!text.trim()) {
            return res.status(400).json({
                error: 'Text cannot be empty. Please enter some text.'
            })
        }
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
2. Combine related sentences into a shorter paragrap.
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
        const summary = interaction.output_text

        if (!summary || !summary.trim()) {
            return res.status(502).json({
                error: 'AI returned an empty summary. Please try again.'
            })
        }

        console.log('Gemini Response:', summary)

        res.json({
            summary: summary
        })

    } catch (error) {
        console.error('Gemini API Error:', error)

        res.status(500).json({
            error: 'Failed to generate summary'
        })
    }
})
app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            error: 'Request is too large. Please enter less text.'
        })
    }

    next(err)
})
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})