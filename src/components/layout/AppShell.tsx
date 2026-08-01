import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { getSession, hasAdminRole, signOut } from "../../lib/auth";

export function AppShell() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const { totalItems } = useCart();

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
          <Link to="/cart" className="nav-cart" aria-label={`Cart, ${totalItems} item${totalItems !== 1 ? "s" : ""}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            Cart
            {totalItems > 0 && (
              <span className="nav-cart-badge" aria-hidden="true">
                {totalItems}
              </span>
            )}
          </Link>
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

