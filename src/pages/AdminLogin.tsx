import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getSession, hasAdminRole, signInWithPassword } from "../lib/auth";
import { hasSupabaseConfig } from "../lib/supabase";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function redirectIfAdmin() {
      const session = await getSession();
      const user = session?.user;
      if (!user) {
        return;
      }

      const isAdmin = await hasAdminRole(user.id);
      if (isAdmin) {
        navigate("/admin/dashboard", { replace: true });
      }
    }

    void redirectIfAdmin();
  }, [navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!hasSupabaseConfig) {
        throw new Error("Add your Supabase URL and anon key to the environment first.");
      }

      const data = await signInWithPassword(email, password);
      const user = data.session?.user;
      if (!user) {
        throw new Error("No session was returned from Supabase.");
      }

      const isAdmin = await hasAdminRole(user.id);
      if (!isAdmin) {
        throw new Error("This account is not listed as an admin in Supabase.");
      }

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in to admin CRM.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="panel stack">
      <div>
        <h1>Admin login</h1>
        <p className="muted">
          Use this screen to access the CRM mode and customer demographics.
        </p>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="admin-email">Email</label>
          <input
            id="admin-email"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {error ? <p className="muted">{error}</p> : null}
        <button className="button primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Opening CRM…" : "Open CRM"}
        </button>
      </form>
    </section>
  );
}

