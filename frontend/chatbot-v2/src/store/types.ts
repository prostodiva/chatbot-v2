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



//assistant types
export interface ChatMessage {
    id: string;
    content: string;
    sender: 'user' | 'assistant';
    timestamp: string;
}

export interface Conversation {
    id: string;
    user_id: number;
    query: string;
    name?: string;
    rules?: string;
    created_at: string;
    updated_at: string;
}

export interface ChatState {
    conversations: Conversation[];
    currentConversation: Conversation | null;
    messages: ChatMessage[];
    isLoading: boolean;
    isLoadingConversations: boolean;
    error: string | null;
}


