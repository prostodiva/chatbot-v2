import { createAsyncThunk } from "@reduxjs/toolkit";
import { userService } from "../api/userService.ts";

/**
 * Async thunk for user logout
 *
 * Logs out the current user and clears authentication
 *
 * @author Margarita Kattsyna
 */
export const logoutUser = createAsyncThunk("user/logout", async () => {
  await userService.logout();
});
