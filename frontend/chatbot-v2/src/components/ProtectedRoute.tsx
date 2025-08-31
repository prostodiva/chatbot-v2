import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks/useAppDispatch';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.user.user);
    const authToken = localStorage.getItem('authToken');

    useEffect(() => {
        if (!authToken || !user) {
            navigate('/login');
        }
    }, [authToken, user, navigate]);

    if (!authToken || !user) {
        return null; // or a loading spinner
    }

    return <>{children}</>;
}

export default ProtectedRoute;
