import { createAsyncThunk } from "@reduxjs/toolkit";
import type { LoginCredentials } from "../types.ts";
import { userService } from "../api/userService.ts";

/**
 * Async thunk for user authentication
 *
 * Logs in a user with email and password
 *
 * @author Margarita Kattsyna
 */
const loginUser = createAsyncThunk(
  "user/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await userService.login(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Login failed",
      );
    }
  },
);

export { loginUser };
