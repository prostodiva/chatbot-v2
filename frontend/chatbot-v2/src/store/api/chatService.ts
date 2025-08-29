const AUTH_BASE_URL = 'http://localhost:3000/api';
const API_BASE_URL = 'http://localhost:3001/api';

class ChatService {
    private async getInternalToken(userToken: string): Promise<string> {
        const response = await fetch(`${AUTH_BASE_URL}/auth/internal-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to get internal token');
        }

        const { internalToken } = await response.json();
        return internalToken;
    }

    async addChat(userToken: string, initialMessage?: string) {
        const internalToken = await this.getInternalToken(userToken);

        const response = await fetch(`${API_BASE_URL}/chat/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${internalToken}`,
            },
            body: JSON.stringify({
                initialMessage: initialMessage || 'New conversation started'
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to create new chat');
        }

        const data = await response.json();
        return data;
    }

    async fetchChats(userToken: string) {
        const internalToken = await this.getInternalToken(userToken);

        const response = await fetch(`${API_BASE_URL}/chats`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${internalToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch chats');
        }

        return response.json();
    }

    async fetchMessages(userToken: string, conversationId: string) {
        const internalToken = await this.getInternalToken(userToken);

        const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${internalToken}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch messages');
        }

        return response.json();
    }
}

export default new ChatService();