import { createBrowserRouter, RouterProvider } from "react-router";

import "./App.css";
import Home from "./features/Home";
// import Mode from "./features/Mode";
import PickMyOwn from "./features/PickMyOwn";
import DrawForMe from "./features/DrawForMe";
import ComingSoon from "./features/ComingSoon";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      Component: Home,
    },
    {
      path: "/let-me-pick",
      Component: PickMyOwn,
    },
    {
      path: "/draw-for-me",
      Component: DrawForMe,
    },
    {
      path: "*",
      Component: ComingSoon, // catches invalid navigation (like unfinished pages)
    },
  ]);

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
