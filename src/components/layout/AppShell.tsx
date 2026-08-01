import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { getSession, hasAdminRole, signOut } from "../../lib/auth";

export function AppShell() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadAuthState() {
      const session = await getSession();
      const user = session?.user;

      if (!user) {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setIsLoaded(true);
        return;
      }

      setIsLoggedIn(true);
      try {
        setIsAdmin(await hasAdminRole(user.id));
      } catch {
        setIsAdmin(false);
      } finally {
        setIsLoaded(true);
      }
    }

    void loadAuthState();
  }, []);

  async function handleSignOut() {
    try {
      await signOut();
    } finally {
      setIsLoggedIn(false);
      setIsAdmin(false);
      navigate("/", { replace: true });
    }
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <strong>Little Birdhouse Organics</strong>
          <span>Organic body butters, oils, and botanical blends</span>
        </div>
        <nav className="nav" aria-label="Primary">
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          {isLoaded && (
            <>
              {isAdmin && <Link to="/admin/dashboard">Admin</Link>}
              {isLoggedIn && !isAdmin && <Link to="/account">Account</Link>}
              {isLoggedIn ? (
                <button type="button" className="nav-signout" onClick={handleSignOut}>
                  Sign out
                </button>
              ) : (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/signup">Sign up</Link>
                </>
              )}
            </>
          )}
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="footer">
        Small batch body care, made with natural ingredients and slow, intentional formulas.
      </footer>
    </div>
  );
}

