import { createAsyncThunk } from "@reduxjs/toolkit";
import type { RegisterCredentials } from '../types.ts';
import {userService} from "../api/userService.ts";

const registerUser = createAsyncThunk(
    'user/register',
    async (credentials: RegisterCredentials, { rejectWithValue }) => {
        try {
            const res = await userService.register(credentials);
            return res;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Registration failed'
            );
        }
    }
);

export { registerUser };