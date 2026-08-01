import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { signUpWithPassword } from "../lib/auth";
import { hasSupabaseConfig } from "../lib/supabase";

export default function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      if (!hasSupabaseConfig) {
        throw new Error("Add your Supabase URL and anon key to the environment first.");
      }

      const data = await signUpWithPassword(email, password, {
        fullName,
        phone,
        birthday: birthday || null,
        marketingConsent,
      });

      if (data.session) {
        navigate("/account", { replace: true });
      } else {
        setMessage("Account created. Check your inbox to confirm email before logging in.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="panel stack">
      <div>
        <h1>Sign up</h1>
        <p className="muted">
          Collect contact details, birthday, and marketing consent for your CRM.
        </p>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="signup-name">Full name</label>
          <input
            id="signup-name"
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="signup-phone">Phone</label>
          <input
            id="signup-phone"
            type="tel"
            placeholder="(555) 010-1000"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="signup-birthday">Birthday</label>
          <input
            id="signup-birthday"
            type="date"
            value={birthday}
            onChange={(event) => setBirthday(event.target.value)}
          />
        </div>
        <label className="field">
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(event) => setMarketingConsent(event.target.checked)}
          />
          I consent to marketing emails and birthday promotions.
        </label>
        {message ? <p className="muted">{message}</p> : null}
        {error ? <p className="muted">{error}</p> : null}
        <button className="button primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </section>
  );
}

