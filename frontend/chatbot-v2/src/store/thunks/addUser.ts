import { createAsyncThunk } from "@reduxjs/toolkit";
import type { RegisterCredentials } from "../types.ts";
import { userService } from "../api/userService.ts";

/**
 * Async thunk for user registration
 *
 * Creates a new user account and logs them in
 *
 * @author Margarita Kattsyna
 */
const registerUser = createAsyncThunk(
  "user/register",
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const res = await userService.register(credentials);
      return res;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Registration failed",
      );
    }
  },
);

export { registerUser };
