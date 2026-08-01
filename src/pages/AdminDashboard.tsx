import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { hasSupabaseConfig } from "../lib/supabase";
import { createCustomer, getCustomers } from "../lib/crm";
import {
  adjustInventory,
  createProduct,
  deleteProduct,
  getInventoryLog,
  getProducts,
  updateProduct,
  type ProductInput,
} from "../lib/products";
import type { Customer, InventoryTransaction, Product } from "../types";

type Tab = "customers" | "products";

const REASONS = [
  { value: "restock", label: "Restock (new inventory received)" },
  { value: "sale", label: "Sale (manual order)" },
  { value: "damaged", label: "Damaged / discarded" },
  { value: "adjustment", label: "Inventory adjustment / correction" },
  { value: "transfer", label: "Transfer / moved" },
];

function reasonLabel(value: string) {
  return REASONS.find((r) => r.value === value)?.label ?? value;
}

// ── Inventory adjust panel (per product) ─────────────────────────

function InventoryPanel({
  product,
  onUpdated,
}: {
  product: Product;
  onUpdated: () => void;
}) {
  const [change, setChange] = useState("");
  const [reason, setReason] = useState("restock");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<InventoryTransaction[] | null>(null);
  const [loadingLog, setLoadingLog] = useState(false);

  async function handleAdjust(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const delta = parseInt(change, 10);
    if (isNaN(delta) || delta === 0) { setError("Enter a non-zero number."); return; }
    setError(null);
    setIsSaving(true);
    try {
      await adjustInventory(product.id, delta, reason, note || undefined);
      setChange(""); setNote("");
      onUpdated();
      // Refresh log if visible
      if (log !== null) void loadLog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Adjustment failed.");
    } finally {
      setIsSaving(false);
    }
  }

  async function loadLog() {
    setLoadingLog(true);
    try {
      setLog(await getInventoryLog(product.id));
    } finally {
      setLoadingLog(false);
    }
  }

  function toggleLog() {
    if (log === null) void loadLog();
    else setLog(null);
  }

  return (
    <div className="inventory-panel">
      <form className="inventory-adjust-form" onSubmit={handleAdjust}>
        <p className="eyebrow">Adjust inventory</p>
        <div className="inventory-adjust-row">
          <input
            type="number"
            className="inventory-change-input"
            placeholder="+10 or −3"
            value={change}
            onChange={(e) => setChange(e.target.value)}
            required
          />
          <select
            className="inventory-reason-select"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <button type="submit" className="button primary" disabled={isSaving}>
            {isSaving ? "Saving…" : "Apply"}
          </button>
        </div>
        <input
          className="inventory-note-input"
          placeholder="Optional note (e.g. 'Received shipment #42')"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        {error && <p className="form-error">{error}</p>}
      </form>

      <button type="button" className="text-button inv-log-toggle" onClick={toggleLog}>
        {log === null ? "▸ View history" : "▾ Hide history"}
      </button>

      {log !== null && (
        <div className="inv-log">
          {loadingLog && <p className="muted">Loading…</p>}
          {!loadingLog && log.length === 0 && (
            <p className="muted">No transactions recorded yet.</p>
          )}
          {!loadingLog && log.length > 0 && (
            <table className="table inv-log-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Change</th>
                  <th>Reason</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {log.map((tx) => (
                  <tr key={tx.id}>
                    <td className="muted">{new Date(tx.createdAt).toLocaleString()}</td>
                    <td className={tx.change >= 0 ? "inv-positive" : "inv-negative"}>
                      {tx.change >= 0 ? `+${tx.change}` : tx.change}
                    </td>
                    <td>{reasonLabel(tx.reason)}</td>
                    <td className="muted">{tx.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ── Products section ──────────────────────────────────────────────

function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inventoryId, setInventoryId] = useState<string | null>(null);

  // add-form fields
  const [addName, setAddName] = useState("");
  const [addPrice, setAddPrice] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addDetails, setAddDetails] = useState("");
  const [addSortOrder, setAddSortOrder] = useState("0");
  const [addStock, setAddStock] = useState("0");
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
    setInventoryId(null);
    setEditName(product.name);
    setEditPrice(product.price);
    setEditDescription(product.description);
    setEditDetails(product.details);
    setEditSortOrder(String(product.sortOrder));
  }

  function cancelEdit() { setEditingId(null); }

  function toggleInventory(id: string) {
    setInventoryId((prev) => (prev === id ? null : id));
    setEditingId(null);
  }

  async function handleAdd(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsAdding(true);
    try {
      await createProduct({
        name: addName, price: addPrice, description: addDescription,
        details: addDetails, sort_order: Number(addSortOrder),
        stock_quantity: Number(addStock),
      });
      setAddName(""); setAddPrice(""); setAddDescription("");
      setAddDetails(""); setAddSortOrder("0"); setAddStock("0");
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
        name: editName, price: editPrice, description: editDescription,
        details: editDetails, sort_order: Number(editSortOrder),
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

  const totalStock = products.reduce((sum, p) => sum + p.stockQuantity, 0);

  if (!hasSupabaseConfig) {
    return (
      <div className="panel stack">
        <h2>Products</h2>
        <p className="copy">
          Connect a Supabase project (set <code>VITE_SUPABASE_URL</code> and{" "}
          <code>VITE_SUPABASE_ANON_KEY</code>) and run migrations{" "}
          <code>0003_products.sql</code> and <code>0004_inventory.sql</code> to manage products and inventory here.
        </p>
        <p className="muted">The shop currently shows built-in placeholder products.</p>
      </div>
    );
  }

  return (
    <>
      {/* Summary bar */}
      <div className="panel">
        <div className="inventory-summary">
          <div className="metric">
            <strong>{products.length}</strong>
            <span>product{products.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="metric">
            <strong>{totalStock}</strong>
            <span>total units in stock</span>
          </div>
          <div className="metric">
            <strong>{products.filter((p) => p.stockQuantity === 0).length}</strong>
            <span>out of stock</span>
          </div>
          <div className="metric">
            <strong>{products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 5).length}</strong>
            <span>low stock (≤5)</span>
          </div>
        </div>
      </div>

      <div className="panel stack">
        <div className="admin-section-header">
          <div>
            <h2>Products</h2>
          </div>
          <button type="button" className="button primary" onClick={() => setShowAddForm((v) => !v)}>
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
              <label htmlFor="add-stock">Initial stock quantity</label>
              <input id="add-stock" type="number" min="0" value={addStock} onChange={(e) => setAddStock(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="add-sort">Sort order</label>
              <input id="add-sort" type="number" min="0" value={addSortOrder} onChange={(e) => setAddSortOrder(e.target.value)} />
            </div>
            <div className="actions">
              <button className="button primary" type="submit" disabled={isAdding}>
                {isAdding ? "Adding…" : "Add product"}
              </button>
              <button className="button secondary" type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      <div className="panel stack">
        {isLoading && <p className="muted">Loading products…</p>}
        {!isLoading && products.length === 0 && (
          <p className="muted">No products yet. Add your first product above.</p>
        )}
        {products.map((product) => (
          <div key={product.id}>
            {editingId === product.id ? (
              <form className="form product-form product-edit-form" onSubmit={handleSaveEdit}>
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
                  <button className="button secondary" type="button" onClick={cancelEdit}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="product-row">
                <div className="product-row-info">
                  <div className="product-row-name-line">
                    <strong>{product.name}</strong>
                    <span className="product-row-price">{product.price}</span>
                    <StockPill qty={product.stockQuantity} />
                  </div>
                  <span className="muted product-row-details">{product.details}</span>
                  <p className="copy product-row-desc">{product.description}</p>
                </div>
                <div className="product-row-actions">
                  <button
                    type="button"
                    className={inventoryId === product.id ? "button primary" : "button secondary"}
                    onClick={() => toggleInventory(product.id)}
                  >
                    {inventoryId === product.id ? "Close inventory" : "Inventory"}
                  </button>
                  <button type="button" className="button secondary" onClick={() => startEdit(product)}>Edit</button>
                  <button type="button" className="text-button cart-remove" onClick={() => void handleDelete(product.id, product.name)}>Delete</button>
                </div>
              </div>
            )}

            {inventoryId === product.id && (
              <InventoryPanel product={product} onUpdated={() => void load()} />
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function StockPill({ qty }: { qty: number }) {
  if (qty === 0) return <span className="stock-pill stock-pill-out">Out of stock</span>;
  if (qty <= 5) return <span className="stock-pill stock-pill-low">{qty} left</span>;
  return <span className="stock-pill stock-pill-in">{qty} in stock</span>;
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

