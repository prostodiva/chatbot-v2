import OpenAI from "openai";

export async function generateEmbedding(text) {
    console.log('=== Embedding Service Debug ===');
    console.log('Input text:', text);
    console.log('Input type:', typeof text);
    console.log('Input length:', text ? text.length : 'undefined');
    
    if (!text || typeof text !== 'string') {
        throw new Error(`Invalid input: expected string, got ${typeof text}: ${text}`);
    }
    
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    
    const res = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
    });
    return res.data[0].embedding;
}
