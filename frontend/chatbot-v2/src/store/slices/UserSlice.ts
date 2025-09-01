import { createSlice } from "@reduxjs/toolkit";
import { registerUser } from "../thunks/addUser.ts";
import { fetchCurrentUser } from "../thunks/fetchUsers.ts";
import { loginUser } from "../thunks/loginUser.ts";
import { logoutUser } from "../thunks/logoutUser.ts";
import { initialState } from "../types.ts";

/**
 * User state slice for managing authentication and user profile
 *
 * @description This slice handles:
 * - User authentication (login, logout, register)
 * - User profile management
 * - Authentication state tracking
 * - Loading states and error handling
 *
 * @author Margarita Kattsyna
 */
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    /**
     * Clears any error messages from the user state
     *
     * @param state - Current user state
     */
    clearError: (state) => {
      state.error = null;
    },
    /**
     * Sets the current user and marks them as authenticated
     *
     * @param state - Current user state
     * @param action - Action containing user object
     */
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    //cleanup
    clearUserData: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch current user
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
        .addCase(logoutUser.fulfilled, (state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.error = null;
          state.isLoading = false;
        })
        .addCase(logoutUser.rejected, (state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.error = null;
          state.isLoading = false;
        });
  },
});

export const { clearError, setUser, clearUserData} = userSlice.actions;
export default userSlice.reducer;
