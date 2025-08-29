import { createAsyncThunk } from '@reduxjs/toolkit';
import chatService from '../api/chatService';
import type { ChatMessage } from '../types';

const fetchMessages = createAsyncThunk<
    ChatMessage[], // Return type
    string, // Payload type (conversationId)
    { rejectValue: string }
>(
    'chat/fetchMessages',
    async (conversationId, { rejectWithValue }) => {
        try {
            const userToken = localStorage.getItem('authToken');
            if (!userToken) {
                throw new Error('No authentication token found');
            }

            const messages = await chatService.fetchMessages(userToken, conversationId);
            return messages;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to fetch messages'
            );
        }
    }
);

export { fetchMessages };
