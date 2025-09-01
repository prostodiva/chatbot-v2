import { useState } from "react";
import { GrRobot } from "react-icons/gr";
import type { RootState } from "../store";
import {
  useAppDispatch,
  useAppSelector,
} from "../store/hooks/useAppDispatch.ts";
import { sendMessage } from "../store/thunks/assistantThunks";
import Button from "./ux/Button.tsx";
import Input from "./ux/Input.tsx";
import { ImUser } from "react-icons/im";

/**
 * AI Assistant component that handles chat interactions with the AI
 *
 * @description This component provides the main chat interface where users can:
 * - Send messages to the AI assistant
 * - View conversation history
 * - Receive AI responses in real-time
 * - Manage conversation flow
 *
 * @author Margarita Kattsyna
 */
function AiAssistant() {
  const dispatch = useAppDispatch();
  const { messages, isLoading, currentConversation } = useAppSelector(
    (state: RootState) => state.chat,
  );
  const [inputValue, setInputValue] = useState("");

  /**
   * Handles sending a message to the AI assistant
   *
   * @description This function:
   * 1. Validates the input message
   * 2. Checks if a conversation is selected
   * 3. Dispatches the message to the AI service
   * 4. Clears the input field after sending
   *
   * @throws {Error} When no conversation is selected
   * @throws {Error} When message sending fails
   */
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    if (!currentConversation) {
      console.error("No current conversation selected");
      return;
    }

    try {
      await dispatch(
        sendMessage({
          content: inputValue,
          conversationId: currentConversation.id,
          rules: currentConversation.rules,
        }),
      ).unwrap();
      setInputValue("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  /**
   * Handles keyboard events for the input field
   *
   * @description Allows users to send messages by pressing Enter
   * Shift+Enter creates a new line instead of sending
   *
   * @param e - The keyboard event object
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /**
   * Formats a timestamp string into a readable time format
   *
   * Converts ISO timestamp strings to localized time format
   * Handles invalid dates gracefully
   *
   * @param timestamp - ISO timestamp string
   * @returns Formatted time string or 'Invalid time' on error
   *
   */
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return "Invalid time";
      }
      return date.toLocaleTimeString();
    } catch {
      return "Invalid time";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[800px] flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200">
        <p className="text-sm text-gray-500">I'm here to help!</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-purple-950 rounded-full flex items-center justify-center">
                <GrRobot className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg px-4 py-3">
                <p className="text-gray-900">
                  Hello! I'm your AI assistant. How can I help you today?
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-2">Just now</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    message.sender === "user" ? "bg-gray-500" : "bg-purple-950"
                  }`}
                >
                  {message.sender === "user" ? (
                    <span className="text-white text-sm font-medium">
                      <ImUser />
                    </span>
                  ) : (
                    <GrRobot className="h-5 w-5 text-white" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div
                  className={`rounded-lg px-4 py-3 ${
                    message.sender === "user"
                      ? "bg-blue-100 text-purple-950"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p>{message.content}</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {formatTimestamp(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-purple-950 rounded-full flex items-center justify-center">
                <GrRobot className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex space-x-3">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            className="flex-1 px-4 py-3 border"
            disabled={isLoading}
          />
          <Button secondary rounded onClick={handleSendMessage}>
            Send Message
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AiAssistant;
