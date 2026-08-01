import { Link, useParams } from "react-router-dom";
import { mockCustomers } from "../data/mockCrm";

export default function CustomerDetail() {
  const { customerId } = useParams();
  const customer = mockCustomers.find((entry) => entry.id === customerId);

  if (!customer) {
    return (
      <section className="panel stack">
        <h1>Customer not found</h1>
        <p className="muted">
          The requested customer record does not exist in the sample dataset.
        </p>
        <Link to="/admin/dashboard">Back to dashboard</Link>
      </section>
    );
  }

  return (
    <section className="panel stack">
      <div>
        <h1>{customer.name}</h1>
        <p className="muted">{customer.id}</p>
      </div>

      <div className="grid">
        <div className="panel">
          <strong>Contact</strong>
          <p className="copy">{customer.email}</p>
          <p className="copy">{customer.phone}</p>
        </div>
        <div className="panel">
          <strong>Birthday</strong>
          <p className="copy">{customer.birthday}</p>
        </div>
        <div className="panel">
          <strong>Marketing status</strong>
          <p className="copy">{customer.consent}</p>
        </div>
      </div>

      <div className="panel">
        <strong>Tags</strong>
        <p className="copy">{customer.tags.join(", ")}</p>
      </div>

      <div className="panel">
        <strong>Follow-up notes</strong>
        <p className="copy">
          Later this panel can hold calls, emails, reminders, and audit history.
        </p>
      </div>
    </section>
  );
}

