import { createAsyncThunk } from '@reduxjs/toolkit';
import chatService from "../api/chatService.ts";
import type { Conversation } from "../types.ts";

const fetchCurrentChat = createAsyncThunk<
    Conversation[],
    void,
    { rejectValue: string }
>(
    'chats/fetch', 
    async (_, { rejectWithValue }) => {
        try {
            const userToken = localStorage.getItem('authToken');
            if (!userToken) {
                throw new Error('No authentication token found');
            }

            const chats = await chatService.fetchChats(userToken);
            return chats;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to fetch chats'
            );
        }
    }
);

export { fetchCurrentChat };
