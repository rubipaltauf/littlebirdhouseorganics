import { Link } from "react-router-dom";
import { mockCustomers } from "../data/mockCrm";

export default function AdminDashboard() {
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
            <strong>{mockCustomers.length}</strong>
            <p className="copy">sample customers loaded</p>
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

      <div className="panel">
        <h2>Customers</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Birthday</th>
              <th>Tags</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {mockCustomers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>
                  <div>{customer.email}</div>
                  <div className="muted">{customer.phone}</div>
                </td>
                <td>{customer.birthday}</td>
                <td>{customer.tags.join(", ")}</td>
                <td>
                  <Link to={`/admin/customers/${customer.id}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

