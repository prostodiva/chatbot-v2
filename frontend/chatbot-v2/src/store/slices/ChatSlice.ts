import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { addChat } from "../thunks/addChat";
import { sendMessage } from "../thunks/assistantThunks.ts";
import { fetchCurrentChat } from "../thunks/fetchChats.ts";
import { fetchMessages } from "../thunks/fetchMessages.ts";
import type { ChatMessage, ChatState, Conversation } from "../types";

const initialState: ChatState = {
    conversations: [],
    currentConversation: null,
    messages: [],
    isLoading: false,
    error: null,
};

//manages the overall chat state (conversations, messages)
const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        clearAllChatData: (state) => {
            state.conversations = [];
            state.currentConversation = null;
            state.messages = [];
            state.isLoading = false;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        setCurrentConversation: (state, action: PayloadAction<Conversation>) => {
            state.currentConversation = action.payload;
        },
        clearCurrentConversation: (state) => {
            state.currentConversation = null;
            state.messages = [];
        },
        addMessage: (state, action: PayloadAction<ChatMessage>) => {
            state.messages.push(action.payload);
        },
        addMessagePair: (state, action: PayloadAction<{ userMessage: ChatMessage; assistantMessage: ChatMessage }>) => {
            state.messages.push(action.payload.userMessage, action.payload.assistantMessage);
        },
    },
    extraReducers: (builder) => {
        builder
            // Handle fetchChats
            .addCase(fetchCurrentChat.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCurrentChat.fulfilled, (state, action) => {
                state.isLoading = false;
                state.conversations = action.payload;
                state.error = null;
            })
            .addCase(fetchCurrentChat.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Handle sendMessage
            .addCase(sendMessage.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.isLoading = false;
                if (state.currentConversation) {
                    state.messages.push(action.payload.userMessage, action.payload.assistantMessage);
                }
                state.error = null;
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Handle addChat
            .addCase(addChat.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addChat.fulfilled, (state, action) => {
                state.isLoading = false;
                state.conversations.unshift(action.payload.conversation);
                state.currentConversation = action.payload.conversation;
                state.error = null;
            })
            .addCase(addChat.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
        //handle fetch messages separately for each chat
        .addCase(fetchMessages.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.isLoading = false;
                state.messages = action.payload;
                state.error = null;
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearAllChatData, clearError, setCurrentConversation, clearCurrentConversation, addMessage, addMessagePair } = chatSlice.actions;
export default chatSlice.reducer;