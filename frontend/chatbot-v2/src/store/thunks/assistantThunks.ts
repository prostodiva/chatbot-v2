import { createAsyncThunk } from "@reduxjs/toolkit";
import type { Message } from "../types.ts";

const sendMessage = createAsyncThunk<
    { userMessage: Message; assistantMessage: Message },
    string,
    { rejectValue: string }
>(
    "assistant/sendMessage",
    async (content, { rejectWithValue }) => {
        try {
            const userToken = localStorage.getItem("authToken");
            if (!userToken) throw new Error("No authentication token found");

            const internalTokenResponse = await fetch(
                "http://localhost:3000/api/auth/internal-token",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${userToken}`,
                    },
                }
            );

            if (!internalTokenResponse.ok) {
                throw new Error("Failed to get internal token");
            }

            const { internalToken } = await internalTokenResponse.json();

            const response = await fetch("http://localhost:3001/api/ai/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${internalToken}`,
                },
                body: JSON.stringify({
                    message: {
                        id: Date.now().toString(),
                        content: content,
                        sender: "user",
                        timestamp: new Date().toISOString()
                    },
                    conversationId: 1
                }),
            });

            if (!response.ok) {
                if (response.status === 401) throw new Error("Authentication required");
                throw new Error("Failed to send message");
            }

            const data = await response.json();

            const userMessage: Message = {
                id: Date.now().toString(),
                content,
                sender: "user",
                timestamp: new Date().toISOString(),
            };

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: data.message,
                sender: "assistant",
                timestamp: data.timestamp ?? new Date().toISOString(),
            };

            return { userMessage, assistantMessage };
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : "Failed to send message"
            );
        }
    }
);

export { sendMessage };
