import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
} from "../types.ts";
import { API_CONFIG } from "./api.ts";

/**
 * Service class for managing user authentication and profile operations
 *
 * This service handles all user-related API calls:
 * - User registration and login
 * - Profile management
 * - Authentication token handling
 * - Session management
 * @author Margarita Kattsyna
 */
class UserService {
  /**
   * Creates authentication headers for API requests
   *
   * Generates headers with the user's authentication token
   *
   * @returns Object containing Authorization header or empty object if no token
   */
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return {};
    }
    return { Authorization: `Bearer ${token}` };
  }

  /**
   * Authenticates a user with email and password
   *
   * Performs login and stores the authentication token
   *
   * @param credentials - User login credentials
   * @returns Promise resolving to authentication response with user data and token
   * @throws {Error} When login fails
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_CONFIG.AUTH_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();
    // Store the token
    localStorage.setItem("authToken", data.token);
    return data;
  }

  /**
   * Registers a new user account
   *
   * Creates a new user account and automatically logs them in
   *
   * @param credentials - User registration credentials
   * @returns Promise resolving to authentication response with user data and token
   * @throws {Error} When registration fails
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_CONFIG.AUTH_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error("Registration failed");
    }

    const data = await response.json();
    // Store the token
    localStorage.setItem("authToken", data.token);
    return data;
  }

  /**
   * Retrieves the current authenticated user's profile
   *
   *  Fetches user information using the stored authentication token
   *
   * @returns Promise resolving to user profile data
   * @throws {Error} When user retrieval fails
   */
  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_CONFIG.AUTH_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log("Auth error response:", errorData);
      throw new Error("Failed to get user");
    }

    return response.json();
  }

  async logout(): Promise<void> {
    localStorage.removeItem("authToken");
  }
}

export const userService = new UserService();
