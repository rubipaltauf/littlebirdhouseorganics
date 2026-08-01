import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSession } from "../lib/auth";
import { useCart } from "../context/CartContext";

function DiscountInput() {
  const { totalPrice, appliedCode, discountAmount, applyCode, removeCode } = useCart();
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setStatus(null);
    const result = await applyCode(input.trim());
    setStatus({ ok: result.success, msg: result.message });
    if (result.success) setInput("");
    setLoading(false);
  }

  if (appliedCode) {
    const saving =
      appliedCode.type === "percent"
        ? `${appliedCode.value}% off`
        : `$${discountAmount.toFixed(2)} off`;
    return (
      <div className="discount-applied">
        <span className="discount-applied-badge">
          🏷 {appliedCode.code} — {saving}
        </span>
        <button type="button" className="text-button cart-remove" onClick={removeCode}>
          Remove
        </button>
      </div>
    );
  }

  return (
    <form className="discount-form" onSubmit={handleApply}>
      <div className="discount-input-row">
        <input
          className="discount-code-input"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          placeholder="Discount code"
          aria-label="Discount code"
          disabled={totalPrice === 0}
        />
        <button type="submit" className="button secondary" disabled={loading || !input.trim()}>
          {loading ? "…" : "Apply"}
        </button>
      </div>
      {status && (
        <p className={status.ok ? "discount-msg-ok" : "discount-msg-err"}>{status.msg}</p>
      )}
    </form>
  );
}

export default function Cart() {
  const { items, removeItem, updateQty, clearCart, totalPrice, discountAmount, finalPrice } =
    useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    void getSession().then((s) => setIsLoggedIn(Boolean(s?.user)));
  }, []);

  if (items.length === 0) {
    return (
      <section className="cart-page stack">
        <div className="hero panel cart-empty">
          <p className="eyebrow">Your cart</p>
          <h1>Your cart is empty.</h1>
          <p className="copy">Browse the collection and add something you love.</p>
          <div className="actions">
            <Link className="button primary" to="/shop">
              Shop the collection
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-page stack">
      <div className="hero panel cart-hero">
        <p className="eyebrow">Your cart</p>
        <h1>Review your order.</h1>
      </div>

      <div className="cart-layout">
        <ul className="cart-items panel stack">
          {items.map((item) => (
            <li key={item.name} className="cart-item">
              <div className="cart-item-info">
                <strong className="cart-item-name">{item.name}</strong>
                <span className="cart-item-unit">{item.price} each</span>
              </div>
              <div className="cart-item-controls">
                <div className="qty-stepper">
                  <button type="button" aria-label="Decrease quantity" onClick={() => updateQty(item.name, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                  <span>{item.quantity}</span>
                  <button type="button" aria-label="Increase quantity" onClick={() => updateQty(item.name, item.quantity + 1)}>+</button>
                </div>
                <strong className="cart-item-total">${(item.priceNum * item.quantity).toFixed(2)}</strong>
                <button type="button" className="text-button cart-remove" aria-label={`Remove ${item.name}`} onClick={() => removeItem(item.name)}>Remove</button>
              </div>
            </li>
          ))}
        </ul>

        <div className="cart-summary panel stack">
          <p className="eyebrow">Order summary</p>

          <DiscountInput />

          <div className="cart-summary-row">
            <span>Subtotal</span>
            <strong>${totalPrice.toFixed(2)}</strong>
          </div>
          {discountAmount > 0 && (
            <div className="cart-summary-row discount-saving-row">
              <span>Discount</span>
              <strong>−${discountAmount.toFixed(2)}</strong>
            </div>
          )}
          <div className="cart-summary-row muted">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <hr className="cart-divider" />
          <div className="cart-summary-row cart-total-row">
            <strong>Total</strong>
            <strong>${finalPrice.toFixed(2)}</strong>
          </div>

          {isLoggedIn ? (
            <button type="button" className="button primary cart-checkout-btn" disabled>
              Checkout — coming soon
            </button>
          ) : (
            <>
              <button type="button" className="button primary cart-checkout-btn" disabled>
                Checkout as guest — coming soon
              </button>
              <div className="cart-signin-prompt">
                <span>Have an account?</span>
                <Link to="/login" state={{ from: "/cart" }} className="cart-signin-link">
                  Sign in for faster checkout
                </Link>
              </div>
            </>
          )}

          <div className="actions">
            <Link className="button secondary" to="/shop">Continue shopping</Link>
            <button type="button" className="text-button cart-clear" onClick={clearCart}>Clear cart</button>
          </div>
        </div>
      </div>
    </section>
  );
}
