import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    // The SDK doesn't have a direct listModels but we can try to find what it supports
    console.log("Checking model availability...")
    // Actually, let's try gemini-pro again but with v1 explicitly if possible? 
    // No, the SDK handles it.
    
    // Let's try gemini-1.5-flash-001 or gemini-1.5-flash-latest
    const modelsToTry = ["gemini-pro", "gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro"];
    
    for (const m of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: m })
            const result = await model.generateContent("hello")
            console.log(`Model ${m} is working!`)
        } catch (e) {
            console.log(`Model ${m} failed: ${e.message}`)
        }
    }
}

listModels()
