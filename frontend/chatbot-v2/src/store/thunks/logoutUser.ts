import { createAsyncThunk } from "@reduxjs/toolkit";
import { userService } from "../api/userService.ts";
import { clearCalendarData } from "../slices/CalendarSlice.ts";
import { clearAllChatData } from "../slices/ChatSlice.ts";

/**
 * Async thunk for user logout
 *
 * Logs out the current user and clears authentication
 *
 * @author Margarita Kattsyna
 */
export const logoutUser = createAsyncThunk(
    "user/logout", 
    async (_, { dispatch }) => { // ✅ Use thunkAPI.dispatch
        try {
            // ✅ Clear all data before logout
            dispatch(clearCalendarData());
            dispatch(clearAllChatData());

            // Clear localStorage
            await userService.logout();

            // Force clear any remaining tokens
            localStorage.removeItem('authToken');
            localStorage.removeItem('googleCalendarToken'); // If you store this

            // Clear any session storage
            sessionStorage.clear();

            return { success: true };
        } catch (error) {
            console.error('Error during logout:', error);
            // Even if there's an error, clear the data
            dispatch(clearCalendarData());
            dispatch(clearAllChatData());
            localStorage.removeItem('authToken');
            throw error; // Re-throw to trigger rejected case
        }
    }
);
