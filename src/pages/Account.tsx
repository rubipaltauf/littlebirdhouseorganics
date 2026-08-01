import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSession, signOut } from "../lib/auth";

export default function Account() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function loadSession() {
      const session = await getSession();
      setEmail(session?.user.email ?? null);
    }

    void loadSession();
  }, []);

  async function handleSignOut() {
    await signOut();
    navigate("/", { replace: true });
  }

  return (
    <section className="panel stack">
      <div>
        <h1>Account</h1>
        <p className="muted">
          Your customer dashboard can later show orders, preferences, and consent
          settings.
        </p>
      </div>
      <div className="panel">
        <strong>{email ?? "Signed in"}</strong>
        <p className="copy">
          This account page is now protected by the Supabase session gate.
        </p>
      </div>
      <ul className="list">
        <li>Profile settings</li>
        <li>Order history</li>
        <li>Saved contact preferences</li>
      </ul>
      <button className="button secondary" type="button" onClick={handleSignOut}>
        Sign out
      </button>
    </section>
  );
}

