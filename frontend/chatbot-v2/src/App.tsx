import Root from "./root/Root.tsx";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import {Provider} from "react-redux";
import {store} from "./store";
import DashboardPage from "./pages/DashboardPage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/home",
        element: <Navigate to="/" replace />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/login",
        element: <LoginPage />
      },
      {
        path: "/dashboard",
        element: <DashboardPage />
      }
    ],
  },
]);

function App() {
  return (
          <Provider store={store}>
            <RouterProvider router={router} />;
          </Provider>
      );
}

export default App;
