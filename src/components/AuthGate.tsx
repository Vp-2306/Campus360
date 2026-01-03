import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function AuthGate({ children }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  // Not logged in → go to login, remember where user wanted to go
  if (!user) {
    return (
      <Navigate
        to="/auth/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // Logged in but profile incomplete → go to profile setup
  if (!user.profileCompleted && location.pathname !== "/profile-setup") {
    return <Navigate to="/profile-setup" replace />;
  }


  return <>{children}</>;
}
