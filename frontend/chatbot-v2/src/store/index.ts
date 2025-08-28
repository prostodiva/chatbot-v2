import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import userReducer from "./slices/UserSlice.ts"

export const store = configureStore({
    reducer: {
        user: userReducer,
    },
});

setupListeners(store.dispatch);

export * from './thunks/fetchUsers.ts';
export * from './thunks/addUser.ts';
export * from './thunks/loginUser.ts';
export * from './thunks/logoutUser.ts';

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
