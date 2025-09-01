import { createAsyncThunk } from "@reduxjs/toolkit";
import type { ChatMessage } from "../types.ts";
import { tokenService } from "../api/tokenService.ts";
import { API_CONFIG } from "../api/api.ts";

/**
 * Async thunk for sending messages to the AI assistant
 *
 * This thunk handles the complete message flow:
 * 1. Gets internal authentication token
 * 2. Sends message to AI service
 * 3. Returns formatted message objects for Redux store
 *
 * @author Margarita Kattsyna
 */
const sendMessage = createAsyncThunk<
  { userMessage: ChatMessage; assistantMessage: ChatMessage },
  { content: string; conversationId: string; rules?: string },
  { rejectValue: string }
>(
  "assistant/sendMessage",
  async ({ content, conversationId, rules }, { rejectWithValue }) => {
    try {
      const userToken = localStorage.getItem("authToken");
      if (!userToken) throw new Error("No authentication token found");

      const internalToken = await tokenService.getInternalToken(userToken);

      const response = await fetch(`${API_CONFIG.MAIN_API_URL}/chat`, {
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
            timestamp: new Date().toISOString(),
          },
          conversationId: conversationId,
          rules: rules,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Authentication required");
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content,
        sender: "user",
        timestamp: new Date().toISOString(),
      };

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        sender: "assistant",
        timestamp: data.timestamp ?? new Date().toISOString(),
      };

      return { userMessage, assistantMessage };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to send message",
      );
    }
  },
);

export { sendMessage };
