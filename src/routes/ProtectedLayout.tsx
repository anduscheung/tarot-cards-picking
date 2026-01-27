import { Navigate, Outlet, useLocation } from "react-router";
import { getToken, isTokenValid } from "../utils/auth";
import { ROUTES } from "./paths";

export default function ProtectedLayout() {
  const location = useLocation();
  const authed = isTokenValid(getToken());

  if (!authed) {
    return (
      <Navigate
        to={ROUTES.login}
        replace //current protected URL won’t stay in the browser history
        state={{ from: location }} // Stores the current location in state.from. Can be used in the login page to send the user back
      />
    );
  }
  return <Outlet />; // renders child private routes
}
