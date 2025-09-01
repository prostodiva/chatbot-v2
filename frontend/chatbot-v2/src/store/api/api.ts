export const API_CONFIG = {
  AUTH_BASE_URL:
    import.meta.env.VITE_AUTH_API_URL || "http://localhost:3000/api",
  MAIN_API_URL:
    import.meta.env.VITE_MAIN_API_URL || "http://localhost:3001/api",
  ENVIRONMENT: import.meta.env.MODE || "development",
} as const;

// Helper functions for common URL patterns
export const getAuthUrl = (endpoint: string) =>
  `${API_CONFIG.AUTH_BASE_URL}${endpoint}`;
export const getMainApiUrl = (endpoint: string) =>
  `${API_CONFIG.MAIN_API_URL}${endpoint}`;
