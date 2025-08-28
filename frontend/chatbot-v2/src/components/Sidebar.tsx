import { PiChatCircle, PiGear } from 'react-icons/pi';

function Sidebar() {
    const handleNewChat = () => {

        console.log('New chat clicked');
    };

    const handleSettings = () => {

        console.log('Settings clicked');
    };

    return (
        <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <nav className="space-y-2">
                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors"
                    >
                        <PiChatCircle className="h-5 w-5" />
                        <span>New Chat</span>
                    </button>
                    <button
                        onClick={handleSettings}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors"
                    >
                        <PiGear className="h-5 w-5" />
                        <span>Settings</span>
                    </button>
                </nav>
            </div>
        </div>
    );
}

export default Sidebar;