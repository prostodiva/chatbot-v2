import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks/useAppDispatch";


/**
 * Props interface for ProtectedRoute component
 *
 * Defines the properties that can be passed to ProtectedRoute
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component for securing authenticated routes
 *
 * This component provides authentication protection for routes that require
 * user login. It automatically redirects unauthenticated users to the login page
 * and only renders the protected content when the user is properly authenticated.
 *
 * ## Features
 * - **Authentication Check**: Verifies user authentication status on mount
 * - **Automatic Redirect**: Redirects unauthenticated users to login
 * - **Conditional Rendering**: Only shows protected content when authenticated
 * - **Token Validation**: Checks both Redux state and localStorage for auth tokens
 **/
 function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.user);
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    if (!authToken || !user) {
      navigate("/login");
    }
  }, [authToken, user, navigate]);

  if (!authToken || !user) {
    return null;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
