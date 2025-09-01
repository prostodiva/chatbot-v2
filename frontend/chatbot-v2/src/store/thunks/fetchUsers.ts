import { createAsyncThunk } from "@reduxjs/toolkit";
import { userService } from "../api/userService.ts";

/**
 * Async thunk for fetching current user data
 *
 * Retrieves the authenticated user's profile information
 *
 * @author Margarita Kattsyna
 */
export const fetchCurrentUser = createAsyncThunk(
  "user/fetchCurrent",
  async (_, { rejectWithValue }) => {
    try {
      const user = await userService.getCurrentUser();
      return user;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch user",
      );
    }
  },
);
