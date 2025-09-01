import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
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
  isLoadingConversations: false,
  error: null,
};

/**
 * Chat state slice for managing conversation and message state
 *
 *  This slice handles:
 * - Conversation management (create, fetch, rename)
 * - Message handling (send, fetch, store)
 * - Loading states and error handling
 * - Rules and conversation metadata
 *
 * @author Margarita Kattsyna
 */
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    /**
     * Sets the global loading state for chat operations
     *
     * @param state - Current chat state
     * @param action - Action containing boolean loading value
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    /**
     * Sets the loading state specifically for conversation operations
     *
     * @param state - Current chat state
     * @param action - Action containing boolean loading value
     */
    setLoadingConversations: (state, action: PayloadAction<boolean>) => {
      state.isLoadingConversations = action.payload;
    },
    /**
     * Clears all chat-related data from the store
     *
     * @param state - Current chat state
     */
    clearAllChatData: (state) => {
      state.conversations = [];
      state.currentConversation = null;
      state.messages = [];
      state.isLoading = false;
      state.error = null;
    },
    /**
     * Clears any error messages from the chat state
     *
     * @param state - Current chat state
     */
    clearError: (state) => {
      state.error = null;
    },
    /**
     * Sets the currently active conversation
     *
     * @param state - Current chat state
     * @param action - Action containing conversation object
     */
    setCurrentConversation: (state, action: PayloadAction<Conversation>) => {
      state.currentConversation = action.payload;
    },
    /**
     * Clears the current conversation and its messages
     *
     * @param state - Current chat state
     */
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
      state.messages = [];
    },
    /**
     * Adds a single message to the current conversation
     *
     * @param state - Current chat state
     * @param action - Action containing message object
     */
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },
    /**
     * Adds a pair of messages (user + assistant) to the conversation
     *
     * @param state - Current chat state
     * @param action - Action containing user and assistant messages
     */
    addMessagePair: (
      state,
      action: PayloadAction<{
        userMessage: ChatMessage;
        assistantMessage: ChatMessage;
      }>,
    ) => {
      state.messages.push(
        action.payload.userMessage,
        action.payload.assistantMessage,
      );
    },
    /**
     * Updates the rules for a specific conversation
     *
     * @param state - Current chat state
     * @param action - Action containing conversation ID and new rules
     */
    updateConversationRules: (
      state,
      action: PayloadAction<{ conversationId: string; rules: string }>,
    ) => {
      const conversation = state.conversations.find(
        (c) => c.id === action.payload.conversationId,
      );
      if (conversation) {
        conversation.rules = action.payload.rules;
      }
      if (state.currentConversation?.id === action.payload.conversationId) {
        state.currentConversation.rules = action.payload.rules;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchChats
      .addCase(fetchCurrentChat.pending, (state) => {
        state.isLoadingConversations = true;
        state.error = null;
      })
      .addCase(fetchCurrentChat.fulfilled, (state, action) => {
        state.isLoadingConversations = false;
        state.conversations = action.payload;
        state.error = null;
      })
      .addCase(fetchCurrentChat.rejected, (state, action) => {
        state.isLoadingConversations = false;
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
          state.messages.push(
            action.payload.userMessage,
            action.payload.assistantMessage,
          );
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
        state.messages = action.payload.messages;

        if (state.currentConversation) {
          state.currentConversation = {
            ...state.currentConversation,
            ...action.payload.conversation,
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

        const conversation = state.conversations.find(
          (c) => c.id === conversationId,
        );
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

        const conversation = state.conversations.find(
          (c) => c.id === conversationId,
        );
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
      });
  },
});

export const {
  setLoading,
  setLoadingConversations,
  clearError,
  clearAllChatData,
  setCurrentConversation,
  clearCurrentConversation,
  addMessage,
  addMessagePair,
  updateConversationRules,
} = chatSlice.actions;
export default chatSlice.reducer;
