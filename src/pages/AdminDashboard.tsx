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
  isOnSale,
  updateProduct,
  type ProductInput,
} from "../lib/products";
import {
  createDiscountCode,
  generateCodeString,
  listDiscountCodes,
  setDiscountActive,
} from "../lib/discounts";
import type { Customer, DiscountCode, InventoryTransaction, Product } from "../types";

type Tab = "customers" | "products" | "discounts";

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
  const [addSalePrice, setAddSalePrice] = useState("");
  const [addSaleStartsAt, setAddSaleStartsAt] = useState("");
  const [addSaleEndsAt, setAddSaleEndsAt] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // edit-form fields
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDetails, setEditDetails] = useState("");
  const [editSortOrder, setEditSortOrder] = useState("0");
  const [editSalePrice, setEditSalePrice] = useState("");
  const [editSaleStartsAt, setEditSaleStartsAt] = useState("");
  const [editSaleEndsAt, setEditSaleEndsAt] = useState("");
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
    setEditSalePrice(product.salePrice !== null ? String(product.salePrice) : "");
    setEditSaleStartsAt(product.saleStartsAt ? product.saleStartsAt.slice(0, 16) : "");
    setEditSaleEndsAt(product.saleEndsAt ? product.saleEndsAt.slice(0, 16) : "");
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
        sale_price: addSalePrice ? Number(addSalePrice) : null,
        sale_starts_at: addSaleStartsAt ? new Date(addSaleStartsAt).toISOString() : null,
        sale_ends_at: addSaleEndsAt ? new Date(addSaleEndsAt).toISOString() : null,
      });
      setAddName(""); setAddPrice(""); setAddDescription("");
      setAddDetails(""); setAddSortOrder("0"); setAddStock("0");
      setAddSalePrice(""); setAddSaleStartsAt(""); setAddSaleEndsAt("");
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
        sale_price: editSalePrice ? Number(editSalePrice) : null,
        sale_starts_at: editSaleStartsAt ? new Date(editSaleStartsAt).toISOString() : null,
        sale_ends_at: editSaleEndsAt ? new Date(editSaleEndsAt).toISOString() : null,
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
              <label htmlFor="add-price">Regular price (e.g. $28)</label>
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

            <div className="product-sale-section">
              <p className="eyebrow">Sale / promotion (optional)</p>
              <div className="discount-form-row">
                <div className="field" style={{ flex: 1 }}>
                  <label htmlFor="add-sale-price">Sale price ($)</label>
                  <input id="add-sale-price" type="number" min="0.01" step="0.01" value={addSalePrice} onChange={(e) => setAddSalePrice(e.target.value)} placeholder="Leave blank for no sale" />
                </div>
              </div>
              <div className="discount-form-row">
                <div className="field" style={{ flex: 1 }}>
                  <label htmlFor="add-sale-starts">Sale starts (optional)</label>
                  <input id="add-sale-starts" type="datetime-local" value={addSaleStartsAt} onChange={(e) => setAddSaleStartsAt(e.target.value)} />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label htmlFor="add-sale-ends">Sale ends (optional)</label>
                  <input id="add-sale-ends" type="datetime-local" value={addSaleEndsAt} onChange={(e) => setAddSaleEndsAt(e.target.value)} />
                </div>
              </div>
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
                  <label htmlFor="edit-price">Regular price</label>
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

                <div className="product-sale-section">
                  <p className="eyebrow">Sale / promotion</p>
                  <div className="discount-form-row">
                    <div className="field" style={{ flex: 1 }}>
                      <label htmlFor="edit-sale-price">Sale price ($) — clear to end sale</label>
                      <input id="edit-sale-price" type="number" min="0.01" step="0.01" value={editSalePrice} onChange={(e) => setEditSalePrice(e.target.value)} placeholder="Leave blank for no sale" />
                    </div>
                  </div>
                  <div className="discount-form-row">
                    <div className="field" style={{ flex: 1 }}>
                      <label htmlFor="edit-sale-starts">Sale starts</label>
                      <input id="edit-sale-starts" type="datetime-local" value={editSaleStartsAt} onChange={(e) => setEditSaleStartsAt(e.target.value)} />
                    </div>
                    <div className="field" style={{ flex: 1 }}>
                      <label htmlFor="edit-sale-ends">Sale ends</label>
                      <input id="edit-sale-ends" type="datetime-local" value={editSaleEndsAt} onChange={(e) => setEditSaleEndsAt(e.target.value)} />
                    </div>
                  </div>
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
                    {isOnSale(product) && product.salePrice !== null ? (
                      <>
                        <span className="price-strike product-row-price">{product.price}</span>
                        <span className="sale-price-display product-row-price">${product.salePrice % 1 === 0 ? product.salePrice : product.salePrice.toFixed(2)}</span>
                        <span className="sale-badge-sm">ON SALE</span>
                      </>
                    ) : (
                      <span className="product-row-price">{product.price}</span>
                    )}
                    {product.salePrice !== null && !isOnSale(product) && (
                      <span className="sale-badge-sm sale-badge-scheduled">SALE SCHEDULED</span>
                    )}
                    <StockPill qty={product.stockQuantity} />
                  </div>
                  {isOnSale(product) && product.saleEndsAt && (
                    <span className="sale-ends-note">Sale ends {new Date(product.saleEndsAt).toLocaleDateString()}</span>
                  )}
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

function BirthdayPanel({ customers, onCodeCreated }: { customers: Customer[]; onCodeCreated: () => void }) {
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generateBirthdayCode(c: Customer) {
    setGeneratingId(c.id);
    setError(null);
    const firstName = c.full_name.split(" ")[0].toUpperCase();
    const code = `BDAY-${firstName}-${generateCodeString(6)}`;
    const now = new Date();
    const expires = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    try {
      await createDiscountCode({
        code,
        type: "percent",
        value: 20,
        min_order: 0,
        max_uses: 1,
        expires_at: expires.toISOString(),
        trigger_type: "birthday",
        assigned_to: c.id,
      });
      void navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 3000);
      onCodeCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate code.");
    } finally {
      setGeneratingId(null);
    }
  }

  return (
    <div className="panel stack birthday-panel">
      <h2>🎂 Birthdays this month</h2>
      {error && <p className="form-error">{error}</p>}
      {copiedCode && <p className="discount-msg-ok">Code <strong>{copiedCode}</strong> created &amp; copied to clipboard!</p>}
      <ul className="birthday-list">
        {customers.map(c => (
          <li key={c.id} className="birthday-row">
            <div>
              <strong>{c.full_name}</strong>
              <span className="muted"> — {c.email}</span>
              {c.birthday && (
                <span className="muted"> · {new Date(c.birthday).toLocaleDateString("en-US", { month: "long", day: "numeric" })}</span>
              )}
            </div>
            <button
              type="button"
              className="button primary"
              onClick={() => void generateBirthdayCode(c)}
              disabled={generatingId === c.id}
            >
              {generatingId === c.id ? "Generating…" : "Generate birthday code"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

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

  const thisMonth = new Date().getMonth();
  const birthdayCustomers = customers.filter((c) => {
    if (!c.birthday) return false;
    return new Date(c.birthday).getMonth() === thisMonth;
  });

  return (
    <>
      {birthdayCustomers.length > 0 && (
        <BirthdayPanel customers={birthdayCustomers} onCodeCreated={() => void loadCustomers()} />
      )}
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
            <p className="copy">{birthdayCustomers.length} birthday{birthdayCustomers.length !== 1 ? "s" : ""} this month</p>
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

// ── Discounts section ─────────────────────────────────────────────

function DiscountsSection() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // form fields
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("0");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  async function load() {
    try { setCodes(await listDiscountCodes()); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to load codes."); }
    finally { setIsLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  function randomize() { setCode(generateCodeString()); }

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await createDiscountCode({
        code,
        type,
        value: parseFloat(value),
        min_order: parseFloat(minOrder) || 0,
        max_uses: maxUses ? parseInt(maxUses, 10) : null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        trigger_type: "manual",
      });
      setCode(""); setValue(""); setMinOrder("0"); setMaxUses(""); setExpiresAt("");
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create code.");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive(dc: DiscountCode) {
    try {
      await setDiscountActive(dc.id, !dc.isActive);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update code.");
    }
  }

  function copyCode(dc: DiscountCode) {
    void navigator.clipboard.writeText(dc.code);
    setCopiedId(dc.id);
    setTimeout(() => setCopiedId(null), 1800);
  }

  if (!hasSupabaseConfig) {
    return (
      <div className="panel stack">
        <h2>Discount codes</h2>
        <p className="copy">Connect Supabase and run <code>0005_discount_codes.sql</code> to manage discount codes.</p>
      </div>
    );
  }

  return (
    <>
      <div className="panel stack">
        <div className="admin-section-header">
          <div>
            <h2>Discount codes</h2>
            <p className="muted">{codes.length} code{codes.length !== 1 ? "s" : ""} • {codes.filter(c => c.isActive).length} active</p>
          </div>
          <button type="button" className="button primary" onClick={() => setShowForm(v => !v)}>
            {showForm ? "Cancel" : "+ Create code"}
          </button>
        </div>

        {error && <p className="form-error">{error}</p>}

        {showForm && (
          <form className="form product-form" onSubmit={handleCreate}>
            <h3>New discount code</h3>

            <div className="field">
              <label htmlFor="dc-code">Code</label>
              <div className="discount-code-gen-row">
                <input
                  id="dc-code"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER20"
                  required
                  style={{ flex: 1 }}
                />
                <button type="button" className="button secondary" onClick={randomize}>
                  Generate random
                </button>
              </div>
            </div>

            <div className="discount-form-row">
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="dc-type">Type</label>
                <select id="dc-type" value={type} onChange={e => setType(e.target.value as "percent" | "fixed")}>
                  <option value="percent">Percentage off (%)</option>
                  <option value="fixed">Fixed amount off ($)</option>
                </select>
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="dc-value">{type === "percent" ? "Discount %" : "Discount $"}</label>
                <input id="dc-value" type="number" min="0.01" step="0.01" value={value} onChange={e => setValue(e.target.value)} placeholder={type === "percent" ? "20" : "5.00"} required />
              </div>
            </div>

            <div className="discount-form-row">
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="dc-min">Min order ($)</label>
                <input id="dc-min" type="number" min="0" step="0.01" value={minOrder} onChange={e => setMinOrder(e.target.value)} placeholder="0" />
              </div>
              <div className="field" style={{ flex: 1 }}>
                <label htmlFor="dc-max-uses">Max uses (blank = unlimited)</label>
                <input id="dc-max-uses" type="number" min="1" value={maxUses} onChange={e => setMaxUses(e.target.value)} placeholder="Unlimited" />
              </div>
            </div>

            <div className="field">
              <label htmlFor="dc-expires">Expiry date (optional)</label>
              <input id="dc-expires" type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
            </div>

            <div className="actions">
              <button className="button primary" type="submit" disabled={isSaving}>
                {isSaving ? "Saving…" : "Create code"}
              </button>
              <button className="button secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>

      <div className="panel stack">
        {isLoading && <p className="muted">Loading codes…</p>}
        {!isLoading && codes.length === 0 && <p className="muted">No discount codes yet.</p>}
        {codes.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min order</th>
                <th>Uses</th>
                <th>Expires</th>
                <th>Trigger</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {codes.map(dc => (
                <tr key={dc.id} className={dc.isActive ? "" : "dc-row-inactive"}>
                  <td>
                    <div className="dc-code-cell">
                      <code className="dc-code">{dc.code}</code>
                      <button type="button" className="text-button dc-copy" onClick={() => copyCode(dc)}>
                        {copiedId === dc.id ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </td>
                  <td>
                    {dc.type === "percent" ? `${dc.value}% off` : `$${dc.value.toFixed(2)} off`}
                  </td>
                  <td>{dc.minOrder > 0 ? `$${dc.minOrder.toFixed(2)}` : "—"}</td>
                  <td>{dc.usesCount}{dc.maxUses !== null ? ` / ${dc.maxUses}` : ""}</td>
                  <td className="muted">
                    {dc.expiresAt ? new Date(dc.expiresAt).toLocaleDateString() : "Never"}
                  </td>
                  <td>
                    <span className={`dc-trigger dc-trigger-${dc.triggerType}`}>
                      {dc.triggerType === "birthday" ? "🎂 Birthday" : "Manual"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={dc.isActive ? "button secondary" : "button primary"}
                      onClick={() => void toggleActive(dc)}
                    >
                      {dc.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
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
          <button type="button" className={tab === "customers" ? "button primary" : "button secondary"} onClick={() => setTab("customers")}>Customers</button>
          <button type="button" className={tab === "products" ? "button primary" : "button secondary"} onClick={() => setTab("products")}>Products</button>
          <button type="button" className={tab === "discounts" ? "button primary" : "button secondary"} onClick={() => setTab("discounts")}>Discounts</button>
        </div>
      </div>

      {tab === "customers" && <CustomersSection />}
      {tab === "products" && <ProductsSection />}
      {tab === "discounts" && <DiscountsSection />}
    </section>
  );
}

