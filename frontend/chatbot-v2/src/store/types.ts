export interface User {
    id: number;
    name: string;
    email: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
}

export interface UserState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export const initialState: UserState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

export interface AuthResponse {
    user: User;
    token: string;
}


