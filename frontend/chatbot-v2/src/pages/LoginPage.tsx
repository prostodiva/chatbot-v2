import { useCallback } from 'react';
import { useAppDispatch, useAppSelector} from "../store/hooks/useAppDispatch.ts";
import { Link, useNavigate } from 'react-router-dom';
import { GrRobot } from "react-icons/gr";
import LoginForm from '../components/forms/LoginForm';
import type { LoginCredentials } from "../store/types.ts";
import { clearError } from '../store/slices/UserSlice.ts'
import { loginUser} from "../store";
import {clearAllChatData} from "../store/slices/ChatSlice.ts";

function LoginPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector((state) => state.user);

    const handleLogin = useCallback(
        async (credentials: LoginCredentials) => {
            try {
                dispatch(clearError());
                dispatch(clearAllChatData());
                const result = await dispatch(loginUser(credentials)).unwrap();
                console.log('Login successful:', result);
                navigate('/dashboard');
            } catch (err: any) {
                console.error('Login failed:', err);
            }
        },
        [dispatch, navigate]
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-400 to-indigo-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <Link to="/" className="inline-block">
                        <GrRobot className="h-20 w-20 text-white" />
                    </Link>
                </div>
                <LoginForm onSubmit={handleLogin} isLoading={isLoading} error={error} />
            </div>
        </div>
    );
}

export default LoginPage;