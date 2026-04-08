import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { ScrollText, LogOut, Sparkles } from "lucide-react";
import { getToken, clearToken, isTokenValid, getDisplayName } from "../../utils/auth";
import { ROUTES } from "../../routes/paths";
import styles from "./ProtectedLayout.module.scss";

export type ProtectedLayoutContext = {
  setShowReadingTopBar: Dispatch<SetStateAction<boolean>>;
};

export default function ProtectedLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const displayName = getDisplayName(getToken());
  const isHistoryPage = location.pathname === ROUTES.history;
  const authed = isTokenValid(getToken());

  const isReadingPage =
    location.pathname.startsWith(ROUTES.pickMyOwn) ||
    location.pathname.startsWith(ROUTES.drawForMe);
  const [showReadingTopBar, setShowReadingTopBar] = useState(false);

  // reset on pathname change
  useEffect(() => {
    setShowReadingTopBar(false);
  }, [location.pathname]);

  if (!authed) {
    return (
      <Navigate
        to={ROUTES.home}
        replace //current protected URL won’t stay in the browser history
        state={{ from: location }} // Stores the current location in state.from. Can be used in the login page to send the user back
      />
    );
  }

  const hideTopBar = isReadingPage && !showReadingTopBar;

  const onLogout = () => {
    clearToken();
    navigate(ROUTES.home, { replace: true });
  };

  return (
    <>
      <div
        className={`${styles.topBar} ${hideTopBar ? styles.topBarHidden : styles.topBarVisible}`}
      >
        <div className={styles.user}>
          Hi, <span className={styles.name}>{displayName}</span>
        </div>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.topButton}
            onClick={() =>
              navigate(isHistoryPage ? ROUTES.protectedHome : ROUTES.history, {
                replace: isReadingPage,
              })
            }
          >
            <span>{isHistoryPage ? "Draw Cards" : "Past Readings"}</span>
            {isHistoryPage ? (
              <Sparkles size={18} strokeWidth={2} />
            ) : (
              <ScrollText size={18} strokeWidth={2} />
            )}
          </button>
          <button type="button" className={styles.topButton} onClick={onLogout}>
            <span>Log Out</span>
            <LogOut size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
      <Outlet context={{ setShowReadingTopBar }} /> {/*renders child private routes*/}
    </>
  );
}
