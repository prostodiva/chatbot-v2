/**
 * Core type definitions for the AI Assistant application
 *
 * This file contains all TypeScript interfaces and types used
 * throughout the application for type safety and consistency
 *
 * @author Margarita Kattsyna
 */

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
  sender: "user" | "assistant";
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

export interface CalendarEvent {
    id: string;
    title: string;
    start: string;
    end: string;
    description?: string;
    attendees?: string[];
}

export interface CalendarState {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
}

export interface CalendarEventDetails {
    title: string;
    startTime: string | Date;
    endTime?: string | Date;
    description?: string;
    attendees?: string[];
}
