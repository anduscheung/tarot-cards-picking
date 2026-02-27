import { createBrowserRouter } from "react-router";
import Home from "../features/Home";
import Mode from "../features/Mode";
import PickMyOwn from "../features/PickMyOwn";
import DrawForMe from "../features/DrawForMe";
import NotFound from "../features/NotFound";
import { ROUTES } from ".";
import PublicLayout from "../layouts/PublicLayout";
import ProtectedLayout from "../layouts/ProtectedLayout";

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: ROUTES.home, element: <Home /> },
      { path: ROUTES.login, element: <Home /> },
      { path: ROUTES.signup, element: <Home /> },
    ],
  },
  {
    element: <ProtectedLayout />,
    children: [
      { path: ROUTES.protectedHome, Component: Mode },
      { path: ROUTES.pickMyOwn, Component: PickMyOwn },
      { path: ROUTES.drawForMe, Component: DrawForMe },
    ],
  },
  { path: "*", Component: NotFound }, // catches invalid navigation
]);
