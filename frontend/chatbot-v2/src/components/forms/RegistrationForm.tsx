import { Link } from "react-router-dom";
import Input from "../ux/Input.tsx";
import Button from "../ux/Button.tsx";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAppDispatch, useAppSelector }  from "../../store/hooks/useAppDispatch.ts";
import { MdOutlineAccountCircle } from 'react-icons/md';
import { registerUser } from "../../store";

const RegistrationForm = () => {
  const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);
      try {
      await dispatch(registerUser(formData)).unwrap();
        if (user) {
          navigate("/login");
        }
      } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
  }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };


    return (
    <div className="bg-gray-100 rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Register</h2>
        <p className="text-gray-600">
          Create new account or{' '}
          <Link to="/login" className="inline-block">
            sign in
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <Input
            className="w-full px-4 py-3 border"
            type="text"
            name="name"
            onChange={handleChange}
            value={formData.name}
            required
        />

          <label
              className="block text-sm font-medium text-gray-700">
              Email
          </label>
          <Input
              className="w-full px-4 py-3 border"
              type="text"
              name="email"
              onChange={handleChange}
              value={formData.email}
              required
          />

          <label className="block text-sm font-medium text-gray-700">
              Password
          </label>
          <Input
              className="w-full px-4 py-3 border"
              type="text"
              name="password"
              onChange={handleChange}
              value={formData.password}
              required
          />

          <Button
              secondary
              rounded
              type="submit"
              disabled={isLoading}
          >
              <MdOutlineAccountCircle className="mr-2 inline-flex" />
              {isLoading ? (
                      <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Creating Account...
                      </div>
                  ) : (
                  'Create Account'
              )}
          </Button>
      </form>
    </div>
  );
};

export default RegistrationForm;
