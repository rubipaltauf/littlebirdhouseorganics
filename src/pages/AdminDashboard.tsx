import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { createCustomer, getCustomers } from "../lib/crm";
import type { Customer } from "../types";

export default function AdminDashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [status, setStatus] = useState("Prospect");
  const [lastContact, setLastContact] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  async function loadCustomers() {
    try {
      const nextCustomers = await getCustomers();
      setCustomers(nextCustomers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load customers.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCustomers();
  }, []);

  async function handleCreateCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsCreating(true);

    try {
      await createCustomer({
        full_name: fullName,
        email,
        phone: phone || null,
        birthday: birthday || null,
        customer_status: status,
        last_contact: lastContact || null,
        marketing_consent: marketingConsent,
      });

      setFullName("");
      setEmail("");
      setPhone("");
      setBirthday("");
      setStatus("Prospect");
      setLastContact("");
      setMarketingConsent(false);
      await loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create customer.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <section className="stack">
      <div className="panel stack">
        <div>
          <h1>CRM dashboard</h1>
          <p className="muted">
            Customer birthdays, contact info, notes, and tags will live here.
          </p>
        </div>
        <div className="grid">
          <div className="panel">
            <strong>{customers.length}</strong>
            <p className="copy">customers loaded</p>
          </div>
          <div className="panel">
            <strong>Consent tracking</strong>
            <p className="copy">opt-in flags ready for marketing workflows</p>
          </div>
          <div className="panel">
            <strong>Birthday promos</strong>
            <p className="copy">prepared for automated birthday outreach</p>
          </div>
        </div>
      </div>

      <div className="panel stack">
        <h2>Create customer</h2>
        <form className="form" onSubmit={handleCreateCustomer}>
          <div className="field">
            <label htmlFor="customer-name">Full name</label>
            <input
              id="customer-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="customer-email">Email</label>
            <input
              id="customer-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="customer-phone">Phone</label>
            <input
              id="customer-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="customer-birthday">Birthday</label>
            <input
              id="customer-birthday"
              type="date"
              value={birthday}
              onChange={(event) => setBirthday(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="customer-status">Status</label>
            <select id="customer-status" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="Prospect">Prospect</option>
              <option value="Active">Active</option>
              <option value="VIP">VIP</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="customer-last-contact">Last contact</label>
            <input
              id="customer-last-contact"
              value={lastContact}
              onChange={(event) => setLastContact(event.target.value)}
              placeholder="e.g. 2026-07-31"
            />
          </div>
          <label className="field">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(event) => setMarketingConsent(event.target.checked)}
            />
            Marketing consent
          </label>
          <button className="button primary" type="submit" disabled={isCreating}>
            {isCreating ? "Creating…" : "Create customer"}
          </button>
        </form>
      </div>

      <div className="panel">
        <h2>Customers</h2>
        {error ? <p className="muted">{error}</p> : null}
        {isLoading ? <p className="muted">Loading customers…</p> : null}
        {!isLoading && customers.length === 0 ? <p className="muted">No customers yet.</p> : null}
        {!isLoading && customers.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Birthday</th>
                <th>Status</th>
                <th>Last contact</th>
                <th>Tags</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>
                    <div>{customer.email}</div>
                    <div className="muted">{customer.phone}</div>
                  </td>
                  <td>{customer.birthday}</td>
                  <td>{customer.status}</td>
                  <td>{customer.lastContact}</td>
                  <td>{customer.tags.join(", ")}</td>
                  <td>
                    <Link to={`/admin/customers/${customer.id}`}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </section>
  );
}

