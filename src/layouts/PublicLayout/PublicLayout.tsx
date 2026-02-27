import { Outlet, useLocation } from "react-router";
import LoginModal from "../../features/Auth/LoginModal";
import SignupModal from "../../features/Auth/SignupModal";
import { ROUTES } from "../../routes";

export default function PublicLayout() {
  const location = useLocation();
  const state = location.state as { background?: Location } | undefined;
  const background = state?.background;
  const modalOpen =
    !!background && (location.pathname === ROUTES.login || location.pathname === ROUTES.signup);

  return (
    <>
      <Outlet context={{ modalOpen }} />
      {modalOpen && location.pathname === ROUTES.login && <LoginModal />}
      {modalOpen && location.pathname === ROUTES.signup && <SignupModal />}
    </>
  );
}
