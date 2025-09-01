import { createAsyncThunk } from "@reduxjs/toolkit";
import chatService from "../api/chatService.ts";

/**
 * Async thunk for updating conversation rules
 *
 * Updates the AI behavior rules for a specific conversation
 *
 * @author Margarita Kattsyna
 */
const updateRules = createAsyncThunk<
  { conversationId: string; rules: string }, // Return type
  { conversationId: string; rules: string }, // Payload type
  { rejectValue: string } // Reject value type
>(
  "chat/updateRules",
  async ({ conversationId, rules }, { rejectWithValue }) => {
    try {
      const userToken = localStorage.getItem("authToken");
      if (!userToken) {
        throw new Error("No authentication token found");
      }
      await chatService.updateRules(userToken, conversationId, rules);
      return { conversationId, rules };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update rules",
      );
    }
  },
);

export { updateRules };
