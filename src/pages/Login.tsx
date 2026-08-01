import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getSession, signInWithPassword } from "../lib/auth";
import { hasSupabaseConfig } from "../lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function redirectIfSignedIn() {
      const session = await getSession();
      if (session?.user) {
        navigate("/account", { replace: true });
      }
    }

    void redirectIfSignedIn();
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
      if (data.session) {
        navigate("/account", { replace: true });
      } else {
        setError("Please check your email confirmation status before continuing.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="panel stack">
      <div>
        <h1>Login</h1>
        <p className="muted">
          Sign in with your Supabase-backed customer account.
        </p>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        {error ? <p className="muted">{error}</p> : null}
        <button className="button primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </section>
  );
}

