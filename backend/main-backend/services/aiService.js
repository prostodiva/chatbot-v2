import OpenAI from "openai";

let client = null;

function getClient() {
    if (!client) {
        client = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return client;
}

export async function getAiResponse(message, context = []) {
    const prompt = context.concat([message]).join("\n");

    const response = await getClient().chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
    });

    return response.choices[0].message?.content || "Sorry, I couldn't respond.";
}
