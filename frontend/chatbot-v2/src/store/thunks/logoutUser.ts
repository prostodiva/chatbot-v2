import { createAsyncThunk } from "@reduxjs/toolkit";
import {userService} from "../api/userService.ts";

export const logoutUser = createAsyncThunk('user/logout', async () => {
    await userService.logout();
});