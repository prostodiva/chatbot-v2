import { API_CONFIG } from './api.ts'

class TokenService {
    private static instance: TokenService;
    private tokenCache: Map<string, { token: string; expires: number }> = new Map();

    static getInstance(): TokenService {
        if (!TokenService.instance) {
            TokenService.instance = new TokenService();
        }
        return TokenService.instance;
    }

    async getInternalToken(userToken: string): Promise<string> {
        const cacheKey = userToken;
        const cached = this.tokenCache.get(cacheKey);

        if (cached && cached.expires > Date.now()) {
            return cached.token;
        }

        const response = await fetch(`${API_CONFIG.AUTH_BASE_URL}/auth/internal-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to get internal token');
        }

        const { internalToken } = await response.json();

        this.tokenCache.set(cacheKey, {
            token: internalToken,
            expires: Date.now() + 5 * 60 * 1000
        });

        return internalToken;
    }
}

export const tokenService = TokenService.getInstance();