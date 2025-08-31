import type {
    AuthResponse,
    LoginCredentials,
    RegisterCredentials,
    User,
} from '../types.ts';
import {API_CONFIG} from "./api.ts";

class UserService {
    private getAuthHeaders(): Record<string, string> {
        const token = localStorage.getItem('authToken');
        if (!token) {
            return {};
        }
        return { Authorization: `Bearer ${token}` };
    }

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await fetch(`${API_CONFIG.AUTH_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        // Store the token
        localStorage.setItem('authToken', data.token);
        return data;
    }

    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
        const response = await fetch(`${API_CONFIG.AUTH_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            throw new Error('Registration failed');
        }

        const data = await response.json();
        // Store the token
        localStorage.setItem('authToken', data.token);
        return data;
    }

    async getCurrentUser(): Promise<User> {
        const response = await fetch(`${API_CONFIG.AUTH_BASE_URL}/auth/me`, {
            headers: this.getAuthHeaders(),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.log('Auth error response:', errorData);
            throw new Error('Failed to get user');
        }

        return response.json();
    }

    async logout(): Promise<void> {
        localStorage.removeItem('authToken');
    }
}

export const userService = new UserService();