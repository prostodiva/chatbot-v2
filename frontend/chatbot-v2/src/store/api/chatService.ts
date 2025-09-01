import { tokenService } from "./tokenService.ts";
import { API_CONFIG } from "./api.ts";

/**
 * Service class for managing chat-related API operations
 *
 *  This service handles all communication with the chat backend:
 * - Internal token management
 * - Chat creation and management
 * - Message retrieval and updates
 * - Conversation rules management
 * @author Margarita Kattsyna
 */
class ChatService {
  public async getInternalToken(userToken: string): Promise<string> {
    return await tokenService.getInternalToken(userToken);
  }

  async addChat(userToken: string, initialMessage?: string) {
    const internalToken = await this.getInternalToken(userToken);

    const response = await fetch(`${API_CONFIG.MAIN_API_URL}/chat/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${internalToken}`,
      },
      body: JSON.stringify({
        initialMessage: initialMessage || "New conversation started",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create new chat");
    }

    const data = await response.json();
    return data;
  }

  async fetchChats(userToken: string) {
    const internalToken = await this.getInternalToken(userToken);

    const response = await fetch(`${API_CONFIG.MAIN_API_URL}/chats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${internalToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch chats");
    }

    return response.json();
  }

  async fetchMessages(userToken: string, conversationId: string) {
    const internalToken = await this.getInternalToken(userToken);

    const response = await fetch(
      `${API_CONFIG.MAIN_API_URL}/conversations/${conversationId}/messages`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${internalToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch messages");
    }

    return response.json();
  }

  async updateRules(userToken: string, conversationId: string, rules: string) {
    const internalToken = await this.getInternalToken(userToken);

    const response = await fetch(
      `${API_CONFIG.MAIN_API_URL}/conversations/${conversationId}/rules`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${internalToken}`,
        },
        body: JSON.stringify({ rules }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update rules");
    }

    return response.json();
  }

  async fetchConversation(userToken: string, conversationId: string) {
    const internalToken = await this.getInternalToken(userToken);

    const response = await fetch(
      `${API_CONFIG.MAIN_API_URL}/conversations/${conversationId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${internalToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch conversation");
    }

    return response.json();
  }

  async renameConversation(
    userToken: string,
    conversationId: string,
    name: string,
  ) {
    const internalToken = await this.getInternalToken(userToken);

    const response = await fetch(
      `${API_CONFIG.MAIN_API_URL}/conversations/${conversationId}/rename`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${internalToken}`,
        },
        body: JSON.stringify({ name }),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to rename conversation");
    }

    return response.json();
  }
}

export default new ChatService();
