import { createBrowserRouter } from "react-router";
import Home from "../features/Home";
// import Mode from "../features/Mode";
import PickMyOwn from "../features/PickMyOwn";
import DrawForMe from "../features/DrawForMe";
import ComingSoon from "../features/ComingSoon";
import { ROUTES } from "./";

export const router = createBrowserRouter([
  { path: ROUTES.home, Component: Home },
  { path: ROUTES.letMePick, Component: PickMyOwn },
  { path: ROUTES.drawForMe, Component: DrawForMe },
  { path: "*", Component: ComingSoon }, // catches invalid navigation (like unfinished pages)
]);
