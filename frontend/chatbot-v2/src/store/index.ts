import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {usersReducer} from "./slices/UserSlice.ts"

export const store = configureStore({
    reducer: {
        user: usersReducer,
    },
});

setupListeners(store.dispatch);

export * from './thunks/fetchUsers.ts';
export * from './thunks/addUser.ts';
export * from './thunks/loginUser.ts';
export * from './thunks/logoutUser.ts';

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
