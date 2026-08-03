import { useEffect, useRef } from "react";
import { RouterProvider } from "react-router";

import "./App.css";
import { router } from "./routes";
import { preloadCardImages } from "./utils/preloadCards";

function App() {
  const preloaded = useRef(false);
  useEffect(() => {
    if (preloaded.current) return;
    preloaded.current = true;
    preloadCardImages();
  }, []);

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
