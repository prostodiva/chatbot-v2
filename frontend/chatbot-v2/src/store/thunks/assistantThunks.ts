import { createAsyncThunk } from "@reduxjs/toolkit";
import type { Message } from "../types.ts";

const sendMessage = createAsyncThunk<
    { userMessage: Message; assistantMessage: Message },
    Message,
    { rejectValue: string }
>(
    "assistant/sendMessage",
    async (userMessage, { rejectWithValue }) => {
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

            const response = await fetch("http://localhost:3001/api/assistant/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${internalToken}`,
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    conversationId: null,
                }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Authentication required");
                }
                throw new Error("Failed to send message");
            }

            const data = await response.json();

            const assistantMessage: Message = {
                id: Date.now().toString(),
                content: data.message,
                sender: "assistant",
                timestamp: data.timestamp,
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