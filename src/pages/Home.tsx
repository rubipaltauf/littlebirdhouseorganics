import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="hero">
      <span className="status">Phase 1: storefront + admin CRM starter</span>
      <h1>Sell online now, then grow into a full CRM later.</h1>
      <p>
        This starter is set up for GitHub Pages, with Supabase-ready auth,
        customer profiles, and an admin dashboard for birthdays, follow-ups, and
        tags.
      </p>
      <div className="actions">
        <Link className="button primary" to="/shop">
          View shop
        </Link>
        <Link className="button secondary" to="/admin/login">
          Open admin CRM
        </Link>
      </div>
      <div className="grid">
        <div className="panel">
          <strong>Public storefront</strong>
          <p className="copy">
            Product pages, login/signup, and account pages are wired into the
            router.
          </p>
        </div>
        <div className="panel">
          <strong>CRM mode</strong>
          <p className="copy">
            Admin pages are ready for customer records, birthdays, and consent
            flags.
          </p>
        </div>
        <div className="panel">
          <strong>GitHub Pages</strong>
          <p className="copy">
            The Vite base path and deployment workflow are configured for a
            static publish.
          </p>
        </div>
      </div>
    </section>
  );
}

