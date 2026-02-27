import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { User, LogOut } from "lucide-react";
import { getToken, clearToken, isTokenValid } from "../../utils/auth";
import { ROUTES } from "../../routes/paths";
import styles from "./ProtectedLayout.module.scss";

export default function ProtectedLayout() {
  const location = useLocation();
  const navigate = useNavigate();
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
            onClick={() => navigate(ROUTES.profile)}
          >
            <span>Profile</span>
            <User size={18} strokeWidth={2} />
          </button>

          <button type="button" className={styles.topButton} onClick={onLogout}>
            <span>Logout</span>
            <LogOut size={18} strokeWidth={2} />
          </button>
        </div>
      )}
      <Outlet /> {/*renders child private routes*/}
    </>
  );
}
