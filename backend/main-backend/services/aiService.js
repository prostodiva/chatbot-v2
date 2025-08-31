import OpenAI from "openai";
import { calendarFunctions, executeCalendarFunction } from "./calendarFunctions.js";
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

        // Check if this is a calendar-related request
        const isCalendarRequest = detectCalendarIntent(message);

        if (isCalendarRequest) {
            console.log('Calendar request detected, using function calling...');
            return await handleCalendarRequest(message, userId);
        }

        // Regular RAG-based response for non-calendar requests
        console.log('💬 Regular chat request, using RAG...');
        return await handleRegularChatRequest(message, conversationId, userId, rules);

    } catch (error) {
        console.error('AI service error: ', error);
        throw error;
    }
}

function detectCalendarIntent(message) {
    const lowerMessage = message.toLowerCase();

    // Only treat as calendar if it's EXPLICITLY calendar-related
    const isDefinitelyCalendar =
        // Direct calendar keywords
        lowerMessage.includes('schedule') ||
        lowerMessage.includes('calendar') ||
        lowerMessage.includes('meeting') ||
        lowerMessage.includes('appointment') ||
        lowerMessage.includes('event') ||
        // Specific calendar questions
        (lowerMessage.includes('what') && lowerMessage.includes('schedule')) ||
        (lowerMessage.includes('show') && lowerMessage.includes('schedule')) ||
        (lowerMessage.includes('show') && lowerMessage.includes('meetings')) ||
        (lowerMessage.includes('show') && lowerMessage.includes('events')) ||

        // Calendar actions
        (lowerMessage.includes('create') && (lowerMessage.includes('meeting') || lowerMessage.includes('event'))) ||
        (lowerMessage.includes('book') && (lowerMessage.includes('meeting') || lowerMessage.includes('appointment'))) ||
        (lowerMessage.includes('add') && (lowerMessage.includes('meeting') || lowerMessage.includes('event'))) ||

        // Availability checks
        (lowerMessage.includes('am i free') || lowerMessage.includes('am i busy')) ||
        (lowerMessage.includes('when am i available')) ||

        // Time-specific calendar queries
        (lowerMessage.includes('what do i have') && (lowerMessage.includes('today') || lowerMessage.includes('tomorrow'))) ||
        (lowerMessage.includes('what meetings') && (lowerMessage.includes('today') || lowerMessage.includes('tomorrow')));

    return isDefinitelyCalendar;
}

async function handleCalendarRequest(message, userId) {
    try {
        const openAI = getClient();

        // First, let the AI determine which function to call
        const functionCallResponse = await openAI.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are a helpful AI assistant with access to calendar functions. 
                    Analyze the user's request and determine which calendar function to call.
                    Available functions: ${calendarFunctions.map(f => f.name).join(', ')}`
                },
                {
                    role: "user",
                    content: message
                }
            ],
            functions: calendarFunctions,
            function_call: "auto",
            max_tokens: 1000,
            temperature: 0.1
        });

        const responseMessage = functionCallResponse.choices[0].message;

        // Check if the AI wants to call a function
        if (responseMessage.function_call) {
            const functionName = responseMessage.function_call.name;
            const functionArgs = JSON.parse(responseMessage.function_call.arguments);

            console.log(`🔧 Calling calendar function: ${functionName}`);
            console.log(`�� Function arguments:`, functionArgs);

            // Execute the calendar function
            const result = await executeCalendarFunction(functionName, functionArgs, userId);

            if (result.success) {
                // Format the result for the user
                return formatCalendarResult(result, functionName);
            } else {
                return `❌ ${result.error}`;
            }
        } else {
            // No function call needed, return the AI's response
            return responseMessage.content;
        }
    } catch (error) {
        console.error('Calendar function calling error:', error);
        return `Sorry, I encountered an error while trying to access your calendar: ${error.message}`;
    }
}
function formatCalendarResult(result, functionName) {
    switch (functionName) {
        case 'get_user_schedule':
            if (result.events.length === 0) {
                return `�� ${result.message}`;
            }

            let scheduleText = `�� ${result.message}\n\n`;
            result.events.forEach((event, index) => {
                const startTime = new Date(event.start).toLocaleString();
                const endTime = new Date(event.end).toLocaleString();
                scheduleText += `${index + 1}. **${event.title}**\n`;
                scheduleText += `   🕐 ${startTime} - ${endTime}\n`;
                if (event.description) {
                    scheduleText += `   📝 ${event.description}\n`;
                }
                if (event.attendees.length > 0) {
                    scheduleText += `   �� Attendees: ${event.attendees.join(', ')}\n`;
                }
                scheduleText += '\n';
            });
            return scheduleText;

        case 'create_calendar_event':
            return `✅ ${result.message}`;

        case 'check_calendar_availability':
            if (result.available) {
                return `✅ ${result.message}`;
            } else {
                let availabilityText = `❌ ${result.message}\n\nConflicting events:\n`;
                result.conflictingEvents.forEach((event, index) => {
                    const startTime = new Date(event.start).toLocaleString();
                    const endTime = new Date(event.end).toLocaleString();
                    availabilityText += `${index + 1}. **${event.title}** (${startTime} - ${endTime})\n`;
                });
                return availabilityText;
            }

        case 'list_upcoming_meetings':
            if (result.events.length === 0) {
                return `�� ${result.message}`;
            }
            let meetingsText = `�� ${result.message}\n\n`;
            result.events.forEach((event, index) => {
                const startTime = new Date(event.start).toLocaleString();
                meetingsText += `${index + 1}. **${event.title}**\n`;
                meetingsText += `   🕐 ${startTime}\n`;
                if (event.description) {
                    meetingsText += `   📝 ${event.description}\n`;
                }
                meetingsText += '\n';
            });
            return meetingsText;

        default:
            return result.message || 'Calendar operation completed successfully.';
    }
}

/**
 * Handle regular chat requests using RAG
 */
async function handleRegularChatRequest(message, conversationId, userId, rules) {
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
}




