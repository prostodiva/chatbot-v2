import { Link } from "react-router-dom";
import { GrRobot } from "react-icons/gr";
import RegistrationForm from "../components/forms/RegistrationForm.tsx";

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-400 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-block">
            <GrRobot className="h-20 w-20 text-white" />
          </Link>
        </div>
        <RegistrationForm />
      </div>
    </div>
  );
};

export default RegisterPage;
