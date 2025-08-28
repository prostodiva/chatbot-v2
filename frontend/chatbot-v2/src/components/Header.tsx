import { useAppDispatch } from "../store/hooks/useAppDispatch.ts";
import { useNavigate } from "react-router-dom";
import { PiSignOut } from 'react-icons/pi';
import { GrRobot } from "react-icons/gr";
import { logoutUser} from "../store";

interface  HeaderProps {
  userName?: string;
}

function Header({ userName }: HeaderProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <GrRobot className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">AI Assistant</h1>
          </div>
          <div className="flex items-center space-x-4">
            {userName ? (
                <>
                  <span className="text-sm text-gray-700">Welcome, {userName}</span>
                  <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <PiSignOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
            ) : null}
          </div>
        </div>
      </div>
  );
}

export default Header;
