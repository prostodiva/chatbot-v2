import { createSlice } from "@reduxjs/toolkit";
import type {AssistantState} from "../types.ts";
 import { sendMessage } from "../thunks/assistantThunks.ts";


const initialState: AssistantState = {
    messages: [],
    isLoading: false,
    error: null,
};

const assistantSlice = createSlice({
    name: 'assistant',
    initialState,
    reducers: {
        clearMessages: (state) => {
            state.messages = [];
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(sendMessage.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.isLoading = false;
                state.messages.push(action.payload.userMessage);
                state.messages.push(action.payload.assistantMessage);
                state.error = null;
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
    },
});

export const { clearMessages, clearError } = assistantSlice.actions;
export default assistantSlice.reducer;