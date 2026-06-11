import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Home } from "lucide-react";
import { ROUTES } from "../../routes";
import styles from "../ProtectedLayout/ProtectedLayout.module.scss";

export type DemoLayoutContext = {
  setShowReadingTopBar: Dispatch<SetStateAction<boolean>>;
};

export default function DemoLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const isReadingPage =
    location.pathname.startsWith(ROUTES.demoPickMyOwn) ||
    location.pathname.startsWith(ROUTES.demoDrawForMe);

  const [showReadingTopBar, setShowReadingTopBar] = useState(false);

  // reset on pathname change
  useEffect(() => {
    setShowReadingTopBar(false);
  }, [location.pathname]);

  const hideTopBar = isReadingPage && !showReadingTopBar;

  return (
    <>
      <div
        className={`${styles.topBar} ${hideTopBar ? styles.topBarHidden : styles.topBarVisible}`}
      >
        <div className={styles.user}>
          <span className={styles.name}>Demo Mode</span>
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.topButton} onClick={() => navigate(ROUTES.home)}>
            <span>Exit Demo</span>
            <Home size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      <Outlet context={{ setShowReadingTopBar }} />
    </>
  );
}
