import { createAsyncThunk } from "@reduxjs/toolkit";
import chatService from "../api/chatService";
import type { Conversation } from "../types";

const addChat = createAsyncThunk<
    { conversation: Conversation; message: string }, // Return type
    string | undefined, // Payload type (optional string)
    { rejectValue: string } // Reject value type
>(
    'chat/add',
    async (initialMessage, { rejectWithValue }) => {
        try {
            const userToken = localStorage.getItem('authToken');
            if (!userToken) {
                throw new Error('No authentication token found');
            }

            const newChat = await chatService.addChat(userToken, initialMessage);
            return newChat;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to create chat'
            );
        }
    }
);

export { addChat };
