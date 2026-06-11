import { createBrowserRouter } from "react-router";
import Home from "../features/Home";
import Mode from "../features/Mode";
import PickMyOwn from "../features/PickMyOwn";
import DrawForMe from "../features/DrawForMe";
import History from "../features/History";
import NotFound from "../features/NotFound";
import { ROUTES } from ".";
import PublicLayout from "../layouts/PublicLayout";
import ProtectedLayout from "../layouts/ProtectedLayout";
import DemoLayout from "../layouts/DemoLayout";

export const router = createBrowserRouter([
  {
    path: "/demo",
    element: <DemoLayout />,
    children: [
      { index: true, Component: Mode },
      { path: ROUTES.demoPickMyOwn, Component: PickMyOwn },
      { path: ROUTES.demoDrawForMe, Component: DrawForMe },
    ],
  },
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
      { path: ROUTES.history, Component: History },
    ],
  },
  { path: "*", Component: NotFound }, // catches invalid navigation
]);
