import { Link } from "react-router-dom";

const products = [
  {
    name: "Whipped Body Butter",
    price: "$28",
    description:
      "A lush, cushiony butter for deep hydration and a soft, dewy finish.",
    details: "Shea • mango butter • plant oils",
  },
  {
    name: "Botanical Body Oil",
    price: "$24",
    description:
      "A silky daily oil that sinks in beautifully and leaves skin glowing.",
    details: "Fast-absorbing • warm scent notes",
  },
  {
    name: "Glow Balm",
    price: "$16",
    description:
      "A rich rescue balm for cuticles, elbows, heels, and extra-dry spots.",
    details: "Pocket size • concentrated moisture",
  },
  {
    name: "Seasonal Bundle",
    price: "$42",
    description:
      "A giftable pairing of butter and oil for a complete body care ritual.",
    details: "Limited drop • bundled savings",
  },
];

const promises = [
  "Soft, polished branding that feels gift-worthy.",
  "Simple product blocks ready for real pricing and checkout later.",
  "A calm body-care feel that matches the homepage.",
];

export default function Shop() {
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
          <Link className="button secondary" to="/admin/login">
            Open admin CRM
          </Link>
        </div>
      </div>

      <div className="grid shop-grid">
        {products.map((product) => (
          <article className="panel shop-card" key={product.name}>
            <p className="eyebrow">{product.details}</p>
            <div className="shop-card-header">
              <h2>{product.name}</h2>
              <strong>{product.price}</strong>
            </div>
            <p className="copy">{product.description}</p>
            <button className="button primary shop-button" type="button">
              Add to cart
            </button>
          </article>
        ))}
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
            seasonal bundles when you’re ready to launch the actual catalog.
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
