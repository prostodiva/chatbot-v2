import { createAsyncThunk } from "@reduxjs/toolkit";
import  chatService from "../api/chatService";

const renameConversation = createAsyncThunk<
    { conversationId: string; name: string },
    { conversationId: string; name: string },
    { rejectValue: string }
>(
    'chat/renameConversation',
    async ({ conversationId, name }, { rejectWithValue }) => {
        try {
            const userToken = localStorage.getItem("authToken");
            if (!userToken) throw new Error("No authentication token found");

            await chatService.renameConversation(userToken, conversationId, name);
            return { conversationId, name };
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to rename conversation'
            );
        }
    }
);

export { renameConversation };