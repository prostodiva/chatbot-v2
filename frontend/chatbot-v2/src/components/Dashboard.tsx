import Sidebar from "../components/Sidebar";
import AiAssistant from "./AiAssistant.tsx";

function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-400 to-indigo-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Sidebar />

          <div className="lg:col-span-3 space-y-8">
            <AiAssistant />
          </div>

          <div></div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
