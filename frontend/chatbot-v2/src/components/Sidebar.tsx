import { useEffect, useState } from "react";
import { PiChatCircle, PiGear } from 'react-icons/pi';
import type { RootState } from "../store";
import chatService from "../store/api/chatService.ts";
import { useAppDispatch, useAppSelector } from "../store/hooks/useAppDispatch.ts";
import { clearCurrentConversation, setCurrentConversation } from "../store/slices/ChatSlice.ts";
import { addChat } from "../store/thunks/addChat";
import { fetchCurrentChat } from "../store/thunks/fetchChats";
import { fetchMessages } from "../store/thunks/fetchMessages.ts";
import { updateRules } from "../store/thunks/updateRules.ts";
import type { Conversation } from "../store/types.ts";

function Sidebar() {
    const dispatch = useAppDispatch();
    const { conversations, currentConversation, isLoading, error } = useAppSelector((state: RootState) => state.chat);
    const [rulesInput, setRulesInput] = useState('');
    const [editingRules, setEditingRules] = useState<string | null>(null);

    const handleUpdateRules = async (conversationId: string) => {
        try {
            await dispatch(updateRules({ conversationId, rules: rulesInput })).unwrap();
            setEditingRules(null);
            setRulesInput('');
            console.log('Rules updated successfully');
        } catch (error) {
            console.error('failed to update rules: ', error);
        }
    }

    const startEditingRules = (conversation: Conversation) => {
        setEditingRules(conversation.id);
        setRulesInput(conversation.rules || '');
    };

    const handleNewChat = async () => {
        try {
            await dispatch(addChat("New conversation")).unwrap();
            console.log('New chat created successfully');
        } catch (error) {
            console.error('Failed to create chat:', error);
        }
    };

    const handleSelectChat = async (conversation: Conversation) => {
        dispatch(setCurrentConversation(conversation));
        await dispatch(fetchMessages(conversation.id));
        const updatedConversation = await chatService.fetchConversation(
            localStorage.getItem('authToken')!,
            conversation.id
        );
        dispatch(setCurrentConversation(updatedConversation));
    };

    useEffect(() => {
        dispatch(fetchCurrentChat());
        dispatch(clearCurrentConversation());
    }, [dispatch]);

    let content;
    if (isLoading) {
        content = (
            <div className="text-sm text-gray-500 py-2">
                Loading chats...
            </div>
        );
    } else if (error) {
        content = (
            <div className="text-sm text-red-500 py-2">
                Error: {error}
            </div>
        );
    } else if (conversations.length === 0) {
        content = (
            <div className="text-sm text-gray-500 py-2">
                No conversations yet
            </div>
        );
    } else {
        content = (
            <div className="space-y-1">
                {conversations.map((conversation) => (
                    <div key={conversation.id} className="space-y-2">
                        <button
                            onClick={() => handleSelectChat(conversation)}
                            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                currentConversation?.id === conversation.id
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <div className="truncate">
                                {conversation.query || 'New conversation'}
                            </div>
                            <div className="text-xs text-gray-500">
                                {new Date(conversation.created_at).toLocaleDateString()}
                            </div>
                            {conversation.rules && conversation.rules.trim() !== '' ? (
                                <div className="text-xs text-blue-600 mt-1 flex items-center">
                                    Has rules
                                </div>
                            ) : (
                                <div className="text-xs text-gray-500 mt-1 flex items-center">
                                    No rules provided yet
                                </div>
                            )}

                    </button>

                        {editingRules === conversation.id ? (
                            <div className="px-3 pb-2">
                    <textarea
                        value={rulesInput}
                        onChange={(e) => setRulesInput(e.target.value)}
                        placeholder="Enter your rules for this conversation"
                        className="w-full text-xs p-2 border rounded resize-none"
                        rows={3}
                    />
                                <div className="flex space-x-2 mt-2">
                                    <button
                                        onClick={() => handleUpdateRules(conversation.id)}
                                        className="text-xs px-2 py-1 bg-purple-800 text-white rounded hover:bg-purple-950"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setEditingRules(null)}
                                        className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => startEditingRules(conversation)}
                                className="w-full text-xs text-gray-500 hover:text-gray-700 px-3 py-1"
                            >
                                {conversation.rules ? 'Edit Rules' : 'Add Rules'}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    const handleAddRule = () => {
        console.log('Add rule clicked');
    };

    return (
        <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <nav className="space-y-2">
                    <button
                        onClick={handleNewChat}
                        disabled={isLoading}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors disabled:opacity-50"
                    >
                        <PiChatCircle className="h-5 w-5" />
                        <span>New Chat</span>
                    </button>
                    
                    {content}
                    
                    <button
                        onClick={handleAddRule}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-gray-700 rounded-md transition-colors"
                    >
                        <PiGear className="h-5 w-5" />
                        <span>Calendar</span>
                    </button>
                </nav>
            </div>
        </div>
    );
}

export default Sidebar;
