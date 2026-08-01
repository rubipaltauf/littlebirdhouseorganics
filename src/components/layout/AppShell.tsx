import { Link, Outlet } from "react-router-dom";

export function AppShell() {
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
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign up</Link>
          <Link to="/admin/login">Admin</Link>
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

