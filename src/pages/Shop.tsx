import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProductImage } from "../components/imagery/ProductImage";
import { useCart } from "../context/CartContext";
import { getProducts } from "../lib/products";
import type { Product } from "../types";

const promises = [
  "Soft, polished branding that feels gift-worthy.",
  "Simple product blocks ready for real pricing and checkout later.",
  "A calm body-care feel that matches the homepage.",
];

function StockBadge({ qty }: { qty: number }) {
  if (qty === 0) return <span className="stock-badge stock-out">Out of stock</span>;
  if (qty <= 5) return <span className="stock-badge stock-low">{qty} left</span>;
  return <span className="stock-badge stock-in">In stock</span>;
}

export default function Shop() {
  const { addItem, items } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [added, setAdded] = useState<string | null>(null);

  useEffect(() => {
    void getProducts().then(setProducts);
  }, []);

  function handleAdd(product: Product) {
    addItem({ name: product.name, price: product.price });
    setAdded(product.name);
    setTimeout(() => setAdded(null), 1400);
  }

  function cartQty(name: string) {
    return items.find((i) => i.name === name)?.quantity ?? 0;
  }

  return (
    <section className="shop-page stack">
      <div className="hero shop-hero">
        <span className="status">Organic body butters • oils • bundles</span>
        <div className="hero-copy">
          <p className="eyebrow">The collection</p>
          <h1>Shop the future line-up of skin-softening essentials.</h1>
          <p className="hero-lead">
            These placeholder product cards set the tone for a real storefront:
            warm, minimal, and focused on rich moisture, natural ingredients, and
            elevated self-care.
          </p>
        </div>

        <div className="actions">
          <Link className="button primary" to="/signup">
            Join the launch list
          </Link>
        </div>
      </div>

      <div className="grid shop-grid">
        {products.map((product, i) => {
          const inCart = cartQty(product.name);
          const isOos = product.stockQuantity === 0;
          const atMax = inCart >= product.stockQuantity;
          const disabled = isOos || atMax;

          return (
            <article className="panel shop-card" key={product.name}>
              <div className="shop-card-image-wrap">
                <ProductImage index={i} />
              </div>
              <div className="shop-card-stock-row">
                <p className="eyebrow">{product.details}</p>
                <StockBadge qty={product.stockQuantity} />
              </div>
              <div className="shop-card-header">
                <h2>{product.name}</h2>
                <strong>{product.price}</strong>
              </div>
              <p className="copy">{product.description}</p>
              <button
                className="button primary shop-button"
                type="button"
                onClick={() => handleAdd(product)}
                disabled={disabled}
                title={isOos ? "Out of stock" : atMax ? "You have all available stock in your cart" : undefined}
              >
                {added === product.name ? "Added ✓" : isOos ? "Out of stock" : "Add to cart"}
              </button>
            </article>
          );
        })}
      </div>

      <div className="story-grid">
        <article className="panel stack">
          <p className="eyebrow">Why customers will love it</p>
          <h2>Body care that feels lush, warm, and intentionally made.</h2>
          <ul className="list">
            {promises.map((promise) => (
              <li key={promise}>{promise}</li>
            ))}
          </ul>
        </article>

        <article className="panel stack highlight-panel">
          <p className="eyebrow">Next up</p>
          <h2>Real product photos, checkout, and scent collections.</h2>
          <p className="copy">
            This layout is ready for Stripe product links, sale pricing, and
            seasonal bundles when you're ready to launch the actual catalog.
          </p>
          <div className="actions">
            <Link className="button primary" to="/">
              Back home
            </Link>
            <Link className="button secondary" to="/signup">
              Get updates
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
