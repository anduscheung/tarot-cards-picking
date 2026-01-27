import { createBrowserRouter } from "react-router";
import Home from "../features/Home";
import Mode from "../features/Mode";
import PickMyOwn from "../features/PickMyOwn";
import DrawForMe from "../features/DrawForMe";
import ComingSoon from "../features/ComingSoon";
import Login from "../features/Login";
import { ROUTES } from "./";
import ProtectedLayout from "./ProtectedLayout";

export const router = createBrowserRouter([
  { path: ROUTES.home, Component: Home },
  { path: ROUTES.login, Component: Login },
  {
    element: <ProtectedLayout />,
    children: [
      { path: ROUTES.protectedHome, Component: Mode },
      { path: ROUTES.pickMyOwn, Component: PickMyOwn },
      { path: ROUTES.drawForMe, Component: DrawForMe },
    ],
  },
  { path: "*", Component: ComingSoon }, // catches invalid navigation (like unfinished pages)
]);
