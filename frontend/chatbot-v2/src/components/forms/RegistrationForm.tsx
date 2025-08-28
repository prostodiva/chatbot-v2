import { Link } from "react-router-dom";
import Input from "../ux/Input.tsx";
import { useNavigate } from "react-router-dom";

const RegistrationForm = () => {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    navigate("/login");
  };

  const handleChange = () => {
    console.log("Change");
  };

  return (
    <div className="bg-gray-100 rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Register</h2>
        <p className="text-gray-600">
          Create new account or
          <Link to="/login" className="inline-block">
            sign in
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <Input className="w-full px-4 py-3 border" onChange={handleChange} />
      </form>
    </div>
  );
};

export default RegistrationForm;
