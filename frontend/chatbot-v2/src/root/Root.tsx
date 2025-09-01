/**
 * @function Root
 * @description Root component that establishes the main application layout
 * @see {@link Outlet} - React Router component for rendering nested routes
 * @returns {JSX.Element} The root layout component with header, content area
 * */

import Header from "../components/Header";
import { useAppSelector } from "../store/hooks/useAppDispatch.ts";
import { Outlet } from "react-router-dom";

function Root() {
  const user = useAppSelector((state) => state.user.user);

  return (
    <div>
      <Header userName={user?.name} />
      <Outlet />
    </div>
  );
}

export default Root;
