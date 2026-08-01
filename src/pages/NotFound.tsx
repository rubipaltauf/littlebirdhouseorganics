import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="panel stack">
      <h1>Page not found</h1>
      <p className="muted">The page you requested does not exist.</p>
      <Link to="/">Return home</Link>
    </section>
  );
}

