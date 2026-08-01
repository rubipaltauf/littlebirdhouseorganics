import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { hasSupabaseConfig } from "../lib/supabase";
import { createCustomer, getCustomers } from "../lib/crm";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  type ProductInput,
} from "../lib/products";
import type { Customer, Product } from "../types";

type Tab = "customers" | "products";

// ── Products section ──────────────────────────────────────────────

function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // add-form fields
  const [addName, setAddName] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addDetails, setAddDetails] = useState("");
  const [addSortOrder, setAddSortOrder] = useState("0");
  const [isAdding, setIsAdding] = useState(false);

  // edit-form fields
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDetails, setEditDetails] = useState("");
  const [editSortOrder, setEditSortOrder] = useState("0");
  const [isSaving, setIsSaving] = useState(false);

  async function load() {
    try {
      setProducts(await getProducts());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load products.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  function startEdit(product: Product) {
    setEditingId(product.id);
    setEditName(product.name);
    setEditPrice(product.price);
    setEditDescription(product.description);
    setEditDetails(product.details);
    setEditSortOrder(String(product.sortOrder));
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsAdding(true);
    try {
      await createProduct({
        name: addName,
        price: addPrice,
        description: addDescription,
        details: addDetails,
        sort_order: Number(addSortOrder),
      });
      setAddName(""); setAddPrice(""); setAddDescription("");
      setAddDetails(""); setAddSortOrder("0");
      setShowAddForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create product.");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleSaveEdit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingId) return;
    setError(null);
    setIsSaving(true);
    try {
      await updateProduct(editingId, {
        name: editName,
        price: editPrice,
        description: editDescription,
        details: editDetails,
        sort_order: Number(editSortOrder),
      } satisfies ProductInput);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save product.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setError(null);
    try {
      await deleteProduct(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete product.");
    }
  }

  if (!hasSupabaseConfig) {
    return (
      <div className="panel stack">
        <h2>Products</h2>
        <p className="copy">
          Connect a Supabase project (set <code>VITE_SUPABASE_URL</code> and{" "}
          <code>VITE_SUPABASE_ANON_KEY</code>) and run migration{" "}
          <code>0003_products.sql</code> to manage products here.
        </p>
        <p className="muted">The shop currently shows built-in placeholder products.</p>
      </div>
    );
  }

  return (
    <>
      <div className="panel stack">
        <div className="admin-section-header">
          <div>
            <h2>Products</h2>
            <p className="muted">{products.length} product{products.length !== 1 ? "s" : ""} in catalog</p>
          </div>
          <button
            type="button"
            className="button primary"
            onClick={() => setShowAddForm((v) => !v)}
          >
            {showAddForm ? "Cancel" : "+ Add product"}
          </button>
        </div>

        {error && <p className="form-error">{error}</p>}

        {showAddForm && (
          <form className="form product-form" onSubmit={handleAdd}>
            <h3>New product</h3>
            <div className="field">
              <label htmlFor="add-name">Name</label>
              <input id="add-name" value={addName} onChange={(e) => setAddName(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="add-price">Price (e.g. $28)</label>
              <input id="add-price" value={addPrice} onChange={(e) => setAddPrice(e.target.value)} placeholder="$28" required />
            </div>
            <div className="field">
              <label htmlFor="add-description">Description</label>
              <textarea id="add-description" rows={3} value={addDescription} onChange={(e) => setAddDescription(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="add-details">Ingredient note / details</label>
              <input id="add-details" value={addDetails} onChange={(e) => setAddDetails(e.target.value)} placeholder="Shea • mango butter • plant oils" />
            </div>
            <div className="field">
              <label htmlFor="add-sort">Sort order</label>
              <input id="add-sort" type="number" min="0" value={addSortOrder} onChange={(e) => setAddSortOrder(e.target.value)} />
            </div>
            <div className="actions">
              <button className="button primary" type="submit" disabled={isAdding}>
                {isAdding ? "Adding…" : "Add product"}
              </button>
              <button className="button secondary" type="button" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="panel stack">
        {isLoading && <p className="muted">Loading products…</p>}
        {!isLoading && products.length === 0 && (
          <p className="muted">No products yet. Add your first product above.</p>
        )}
        {products.map((product) =>
          editingId === product.id ? (
            <form key={product.id} className="form product-form product-edit-form" onSubmit={handleSaveEdit}>
              <h3>Edit product</h3>
              <div className="field">
                <label htmlFor="edit-name">Name</label>
                <input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="edit-price">Price</label>
                <input id="edit-price" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="edit-description">Description</label>
                <textarea id="edit-description" rows={3} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} required />
              </div>
              <div className="field">
                <label htmlFor="edit-details">Ingredient note / details</label>
                <input id="edit-details" value={editDetails} onChange={(e) => setEditDetails(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="edit-sort">Sort order</label>
                <input id="edit-sort" type="number" min="0" value={editSortOrder} onChange={(e) => setEditSortOrder(e.target.value)} />
              </div>
              <div className="actions">
                <button className="button primary" type="submit" disabled={isSaving}>
                  {isSaving ? "Saving…" : "Save changes"}
                </button>
                <button className="button secondary" type="button" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div key={product.id} className="product-row">
              <div className="product-row-info">
                <strong>{product.name}</strong>
                <span className="product-row-price">{product.price}</span>
                <span className="muted product-row-details">{product.details}</span>
                <p className="copy product-row-desc">{product.description}</p>
              </div>
              <div className="product-row-actions">
                <button type="button" className="button secondary" onClick={() => startEdit(product)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="text-button cart-remove"
                  onClick={() => void handleDelete(product.id, product.name)}
                >
                  Delete
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
}

// ── Customers section (unchanged logic, extracted) ────────────────

function CustomersSection() {
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
      setCustomers(await getCustomers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load customers.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { void loadCustomers(); }, []);

  async function handleCreateCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsCreating(true);
    try {
      await createCustomer({
        full_name: fullName, email, phone: phone || null,
        birthday: birthday || null, customer_status: status,
        last_contact: lastContact || null, marketing_consent: marketingConsent,
      });
      setFullName(""); setEmail(""); setPhone(""); setBirthday("");
      setStatus("Prospect"); setLastContact(""); setMarketingConsent(false);
      await loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create customer.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <>
      <div className="panel stack">
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
        {error && <p className="form-error">{error}</p>}
        <form className="form" onSubmit={handleCreateCustomer}>
          <div className="field">
            <label htmlFor="customer-name">Full name</label>
            <input id="customer-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="customer-email">Email</label>
            <input id="customer-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="customer-phone">Phone</label>
            <input id="customer-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="customer-birthday">Birthday</label>
            <input id="customer-birthday" type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="customer-status">Status</label>
            <select id="customer-status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Prospect">Prospect</option>
              <option value="Active">Active</option>
              <option value="VIP">VIP</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="customer-last-contact">Last contact</label>
            <input id="customer-last-contact" value={lastContact} onChange={(e) => setLastContact(e.target.value)} placeholder="e.g. 2026-07-31" />
          </div>
          <label className="field">
            <input type="checkbox" checked={marketingConsent} onChange={(e) => setMarketingConsent(e.target.checked)} />
            Marketing consent
          </label>
          <button className="button primary" type="submit" disabled={isCreating}>
            {isCreating ? "Creating…" : "Create customer"}
          </button>
        </form>
      </div>

      <div className="panel">
        <h2>Customers</h2>
        {isLoading && <p className="muted">Loading customers…</p>}
        {!isLoading && customers.length === 0 && <p className="muted">No customers yet.</p>}
        {!isLoading && customers.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th><th>Contact</th><th>Birthday</th>
                <th>Status</th><th>Last contact</th><th>Tags</th><th />
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
                  <td><Link to={`/admin/customers/${customer.id}`}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

// ── Dashboard shell ───────────────────────────────────────────────

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("customers");

  return (
    <section className="stack">
      <div className="panel stack">
        <h1>Admin dashboard</h1>
        <div className="admin-tabs">
          <button
            type="button"
            className={tab === "customers" ? "button primary" : "button secondary"}
            onClick={() => setTab("customers")}
          >
            Customers
          </button>
          <button
            type="button"
            className={tab === "products" ? "button primary" : "button secondary"}
            onClick={() => setTab("products")}
          >
            Products
          </button>
        </div>
      </div>

      {tab === "customers" && <CustomersSection />}
      {tab === "products" && <ProductsSection />}
    </section>
  );
}

