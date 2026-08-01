import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { getSession, hasAdminRole } from "../../lib/auth";

export function AppShell() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadAdminState() {
      const session = await getSession();
      const user = session?.user;

      if (!user) {
        setIsAdmin(false);
        setIsLoaded(true);
        return;
      }

      try {
        setIsAdmin(await hasAdminRole(user.id));
      } catch {
        setIsAdmin(false);
      } finally {
        setIsLoaded(true);
      }
    }

    void loadAdminState();
  }, []);

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <strong>Little Birdhouse Organics</strong>
          <span>Organic body butters, oils, and CRM starter</span>
        </div>
        <nav className="nav" aria-label="Primary">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          {!isLoaded ? null : (
            <>
              {isAdmin ? <Link to="/admin/dashboard">Admin</Link> : null}
              {!isAdmin ? <Link to="/login">Login</Link> : null}
            </>
          )}
          {!isAdmin && isLoaded ? <Link to="/signup">Sign up</Link> : null}
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="footer">
        Built for a GitHub Pages storefront with Supabase-backed auth and CRM.
      </footer>
    </div>
  );
}
