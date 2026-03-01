import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { ScrollText, LogOut, Sparkles } from "lucide-react";
import { getToken, clearToken, isTokenValid } from "../../utils/auth";
import { ROUTES } from "../../routes/paths";
import styles from "./ProtectedLayout.module.scss";

export default function ProtectedLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHistoryPage = location.pathname === ROUTES.history;
  const authed = isTokenValid(getToken());

  if (!authed) {
    return (
      <Navigate
        to={ROUTES.home}
        replace //current protected URL won’t stay in the browser history
        state={{ from: location }} // Stores the current location in state.from. Can be used in the login page to send the user back
      />
    );
  }

  const hideTopBar =
    location.pathname.startsWith(ROUTES.pickMyOwn) ||
    location.pathname.startsWith(ROUTES.drawForMe);

  const onLogout = () => {
    clearToken();
    navigate(ROUTES.home, { replace: true });
  };

  return (
    <>
      {!hideTopBar && (
        <div className={styles.topBar}>
          <button
            type="button"
            className={styles.topButton}
            onClick={() => navigate(isHistoryPage ? ROUTES.protectedHome : ROUTES.history)}
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
      )}
      <Outlet /> {/*renders child private routes*/}
    </>
  );
}
