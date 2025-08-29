import { createAsyncThunk } from '@reduxjs/toolkit';
import chatService from '../api/chatService';
import type { ChatMessage, Conversation } from '../types';

const fetchMessages = createAsyncThunk<
    { messages: ChatMessage[], conversation: Conversation },// Return type
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

            const [messages, conversation] = await Promise.all([
                chatService.fetchMessages(userToken, conversationId),
                chatService.fetchConversation(userToken, conversationId)
            ]);

            return { messages, conversation };
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to fetch messages'
            );
        }
    }
);

export { fetchMessages };
