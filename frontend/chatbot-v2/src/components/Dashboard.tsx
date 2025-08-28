import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import type { RootState } from '../store';

function Dashboard() {
    const { user } = useSelector((state: RootState) => state.user);

    return (
        <div className="min-h-screen bg-gray-50">
             {user?.name}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <Sidebar />

                    <div className="lg:col-span-3 space-y-8">
                       <h1> assistant</h1>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;