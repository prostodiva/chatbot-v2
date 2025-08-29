import { useEffect } from "react";
import { PiChatCircle, PiGear } from 'react-icons/pi';
import type { RootState } from "../store";
import { useAppDispatch, useAppSelector } from "../store/hooks/useAppDispatch.ts";
import { setCurrentConversation } from "../store/slices/ChatSlice.ts";
import { addChat } from "../store/thunks/addChat";
import { fetchCurrentChat } from "../store/thunks/fetchChats";
import type { Conversation } from "../store/types.ts";

function Sidebar() {
    const dispatch = useAppDispatch();
    
    // Get chat state from Redux
    const { conversations, currentConversation, isLoading, error } = useAppSelector((state: RootState) => state.chat);

    const handleNewChat = async () => {
        try {
            await dispatch(addChat("New conversation")).unwrap();
            console.log('New chat created successfully');
        } catch (error) {
            console.error('Failed to create chat:', error);
        }
    };

    const handleSelectChat = (conversation: Conversation) => {
        dispatch(setCurrentConversation(conversation));
    };

    useEffect(() => {
        dispatch(fetchCurrentChat());
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
                    <button
                        key={conversation.id}
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
                    </button>
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
                        <span>Add Rule</span>
                    </button>
                </nav>
            </div>
        </div>
    );
}

export default Sidebar;
