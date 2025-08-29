import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { addChat } from "../thunks/addChat";
import { sendMessage } from "../thunks/assistantThunks.ts";
import { fetchCurrentChat } from "../thunks/fetchChats.ts";
import { fetchMessages } from "../thunks/fetchMessages.ts";
import { updateRules } from "../thunks/updateRules.ts";
import { renameConversation } from "../thunks/renameConversation.ts";
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
        updateConversationRules: (state, action: PayloadAction<{ conversationId: string; rules: string}>) => {
            const conversation = state.conversations.find(c => c.id === action.payload.conversationId);
            if (conversation) {
                conversation.rules = action.payload.rules;
            }
            if (state.currentConversation?.id === action.payload.conversationId) {
                state.currentConversation.rules = action.payload.rules;
            }
        }
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
            .addCase(fetchMessages.pending, (state, action) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.isLoading = false;
                state.messages = action.payload.messages;

                if (state.currentConversation) {
                    state.currentConversation = {
                        ...state.currentConversation,
                        ...action.payload.conversation
                    };
                }
                state.error = null;
            })
            .addCase(fetchMessages.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(updateRules.fulfilled, (state, action) => {
                const { conversationId, rules } = action.payload;

                const conversation = state.conversations.find(c => c.id === conversationId);
                if (conversation) {
                    conversation.rules = rules;
                }

                if (state.currentConversation?.id === conversationId) {
                    state.currentConversation.rules = rules;
                }
                state.error = null;
            })
            .addCase(updateRules.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            .addCase(renameConversation.fulfilled, (state, action) => {
                const { conversationId, name } = action.payload;

                const conversation = state.conversations.find(c => c.id === conversationId);
                if (conversation) {
                    conversation.name = name;
                }

                if (state.currentConversation?.id === conversationId) {
                    state.currentConversation.name = name;
                }

                state.error = null;
            })
            .addCase(renameConversation.rejected, (state, action) => {
                state.error = action.payload as string;
            })
    },
});

export const { clearAllChatData, clearError, setCurrentConversation, clearCurrentConversation, addMessage, addMessagePair, updateConversationRules } = chatSlice.actions;
export default chatSlice.reducer;