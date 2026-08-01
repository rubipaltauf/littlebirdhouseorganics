const products = [
  {
    name: "Organic Starter Bundle",
    price: "$24.00",
    description: "A simple starter product card for the storefront MVP.",
  },
  {
    name: "Seasonal Harvest Box",
    price: "$38.00",
    description: "A placeholder for a future Stripe Checkout product.",
  },
];

export default function Shop() {
  return (
    <section className="stack">
      <div className="panel">
        <h1>Shop</h1>
        <p className="muted">
          These cards are placeholders until Stripe checkout is connected.
        </p>
      </div>

      <div className="grid">
        {products.map((product) => (
          <article className="panel" key={product.name}>
            <h2>{product.name}</h2>
            <p className="copy">{product.description}</p>
            <strong>{product.price}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

