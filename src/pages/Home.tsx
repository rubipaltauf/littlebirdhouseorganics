import { Link } from "react-router-dom";

const featuredProducts = [
  {
    name: "Whipped Body Butter",
    description:
      "Rich, cloud-soft moisture with shea butter, mango butter, and skin-loving oils.",
    note: "Best for dry skin and daily glow.",
  },
  {
    name: "Botanical Body Oil",
    description:
      "A silky finishing oil for post-shower hydration and a warm, natural sheen.",
    note: "Lightweight, fast-absorbing finish.",
  },
  {
    name: "Glow Balm",
    description:
      "A concentrated balm for elbows, cuticles, and extra-dry spots that need extra love.",
    note: "Pocket-friendly rescue moisture.",
  },
];

const benefits = [
  "Small-batch formulas with a clean, luxurious feel.",
  "Organic-inspired ingredients and plant-based fragrance notes.",
  "A calm, elevated look that feels giftable from day one.",
];

export default function Home() {
  return (
    <section className="homepage stack">
      <div className="hero hero-home">
        <span className="status">Organic body care • small batch • soft glow</span>
        <div className="hero-copy">
          <p className="eyebrow">Little Birdhouse Organics</p>
          <h1>Body butters and oils that feel like a quiet, nourishing ritual.</h1>
          <p className="hero-lead">
            A placeholder storefront for a future collection of whipped butters,
            botanical oils, and rich moisture blends made for soft skin and slow,
            beautiful self-care.
          </p>
        </div>

        <div className="actions">
          <Link className="button primary" to="/shop">
            Shop the collection
          </Link>
          <Link className="button secondary" to="/signup">
            Join the list
          </Link>
        </div>

        <div className="hero-metrics">
          <div className="metric">
            <strong>3</strong>
            <span>featured formulas</span>
          </div>
          <div className="metric">
            <strong>100%</strong>
            <span>placeholder ready</span>
          </div>
          <div className="metric">
            <strong>CRM</strong>
            <span>birthday promos ready</span>
          </div>
        </div>
      </div>

      <div className="grid">
        {featuredProducts.map((product) => (
          <article className="panel product-card" key={product.name}>
            <p className="eyebrow">Featured formula</p>
            <h2>{product.name}</h2>
            <p className="copy">{product.description}</p>
            <p className="product-note">{product.note}</p>
          </article>
        ))}
      </div>

      <div className="story-grid">
        <article className="panel stack">
          <p className="eyebrow">Why it works</p>
          <h2>Built for an elevated natural beauty brand.</h2>
          <ul className="list">
            {benefits.map((benefit) => (
              <li key={benefit}>{benefit}</li>
            ))}
          </ul>
        </article>

        <article className="panel stack highlight-panel">
          <p className="eyebrow">Coming soon</p>
          <h2>Seasonal scent drops, gift sets, and skin-softening bundles.</h2>
          <p className="copy">
            This placeholder site can later expand into full product pages, a
            checkout flow, and an email capture form for promotions and launch
            announcements.
          </p>
          <div className="actions">
            <Link className="button primary" to="/shop">
              Preview shop
            </Link>
            <Link className="button secondary" to="/admin/login">
              Open CRM
            </Link>
          </div>
        </article>
      </div>

      <div className="panel banner">
        <div>
          <p className="eyebrow">Soft skin • warm scent • calm branding</p>
          <h2>Placeholder site ready for a real product launch.</h2>
        </div>
        <p className="copy">
          The structure now matches a real storefront for organic body butters
          and oils, so you can swap in products, pricing, and checkout when
          you’re ready.
        </p>
      </div>
    </section>
  );
}
