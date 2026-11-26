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
            input: `You must preserve the original text exactly.
            Do not rewrite, rephrase, round numbers, or change any facts.
            If the input is already short, return the exact same text without changes.
            Only summarize when the input contains multiple sentences or paragraphs.
            
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