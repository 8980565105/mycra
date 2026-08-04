import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface ProtectedRouteProps {
  allowedRoles?: string[]; 
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const token = useSelector((state: RootState) => state.auth.token);
  const user = useSelector((state: RootState) => state.auth.user);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "store_owner") return <Navigate to="/store_owner" replace />;
    return <Navigate to="/login" replace />;
  }


  // ── 3. Admin manually types /store_owner/* → block ──────────────────────────
  if (user.role === "admin" && location.pathname.startsWith("/store_owner")) {
    return <Navigate to="/" replace />;
  }

  // ── 4. Store-owner manually types any non /store_owner/* route → block ───────
  if (
    user.role === "store_owner" &&
    !location.pathname.startsWith("/store_owner")
  ) {
    return <Navigate to="/store_owner" replace />;
  }
  // ✅ 3️⃣ Authorized → allow access\
  return <Outlet />;
};

export default ProtectedRoute;
