import { createBrowserRouter } from "react-router";
import Home from "../features/Home";
import Mode from "../features/Mode";
import PickMyOwn from "../features/PickMyOwn";
import DrawForMe from "../features/DrawForMe";
import ComingSoon from "../features/ComingSoon";
import { ROUTES } from ".";
import HomeWithModal from "./RootWithModal";
import ProtectedLayout from "./ProtectedLayout";

export const router = createBrowserRouter([
  {
    element: <HomeWithModal />,
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
  { path: "*", Component: ComingSoon }, // catches invalid navigation (like unfinished pages)
]);
