import { Link } from "react-router-dom";
import Button from "../components/ux/Button";

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to My Personal Assistant
          </h1>
          <Link to="/register">
            <Button secondary rounded>
              Create a new account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
