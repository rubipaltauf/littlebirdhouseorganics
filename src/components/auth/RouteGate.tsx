import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { getSession, hasAdminRole } from "../../lib/auth";

type RouteGateProps = {
  children: ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
};

export function RouteGate({
  children,
  requireAdmin = false,
  redirectTo = "/login",
}: RouteGateProps) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkAccess() {
      const session = await getSession();
      const user = session?.user;

      if (!user) {
        if (!cancelled) {
          navigate(redirectTo, { replace: true });
        }
        return;
      }

      if (requireAdmin) {
        const isAdmin = await hasAdminRole(user.id);
        if (!isAdmin) {
          if (!cancelled) {
            navigate("/admin/login", { replace: true });
          }
          return;
        }
      }

      if (!cancelled) {
        setReady(true);
      }
    }

    void checkAccess();

    return () => {
      cancelled = true;
    };
  }, [navigate, redirectTo, requireAdmin]);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}
