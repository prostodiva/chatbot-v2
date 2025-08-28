/**
 * @function Root
 * @description Root component that establishes the main application layout
 * @see {@link Outlet} - React Router component for rendering nested routes
 * @returns {JSX.Element} The root layout component with header, content area, and footer
 * */

import  Header from "../components/Header";
import Footer from "../components/Footer";

import { Outlet } from "react-router-dom";

function Root() {
  return (
    <div>
        <Header />
        <Outlet />
        <Footer />
    </div>
  );
}

export default Root;
