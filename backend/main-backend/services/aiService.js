import OpenAI from "openai";
import { findSimilarDocumentsInConversation } from "./vectorSearchService.js";

let client = null;

function getClient() {
    if (!client) {
        client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return client;
}

/*
* RAG Search: Searches for similar previous messages in the conversation
* Context Building: Combines rules + relevant context + current message
* Enhanced Prompting: Sends rich context to AI for better responses
*/
export async function getAiResponse(message, conversationId, userId, rules = null) {
    try {

        console.log('RAG AI Service: ');
        console.log('Message:', message);
        console.log('Conversation ID:', conversationId);
        console.log('User ID:', userId);
        console.log('Rules:', rules);

        //retrieve relevant context
        let context = "";
        try {
            console.log('Searching for relevant context');
            const similarDocs = await findSimilarDocumentsInConversation(message, conversationId, userId, 5);

            if (similarDocs.length > 0) {
                console.log('Found relevant context: ', similarDocs.length + 'documents');
                context = similarDocs.map(doc => `${doc.content}`).join('\n') + '\n\n';
                console.log('Context built:', context.substring(0, 200) + '...');
            } else {
                console.log('no relevant context found');
            }
        } catch (error) {
            console.log('RAG search failed', error.message);
        }

        //build enhanced prompt
        let enhancedPrompt = "";
        if (rules && rules.trim() !== '') {
            enhancedPrompt += `Instructions: ${rules}\n\n`;
            console.log('added rules to prompt');
        }

        if (context) {
            enhancedPrompt += context;
            console.log('added context to prompt');
        }

        enhancedPrompt += `User message: ${message}\n\nPlease respond to the user's message.`;
        console.log('final enhanced prompt: ', enhancedPrompt);

        //sent to open ai with enhanced prompt
        const openAI = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const response = await openAI.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: enhancedPrompt,
                }
            ],
            max_tokens: 1000,
            temperature: 0.7,
        });

        console.log('ai response: ', response);
        return response.choices[0].message.content;
    } catch (error) {
        console.error('ai service error: ', error);
        throw error;
    }
}


