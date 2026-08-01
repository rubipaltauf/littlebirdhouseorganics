import type { Product } from "../types";

export const mockProducts: Product[] = [
  {
    id: "mock-1",
    name: "Whipped Body Butter",
    price: "$28",
    description:
      "A lush, cushiony butter for deep hydration and a soft, dewy finish.",
    details: "Shea • mango butter • plant oils",
    sortOrder: 0,
    stockQuantity: 12,
  },
  {
    id: "mock-2",
    name: "Botanical Body Oil",
    price: "$24",
    description:
      "A silky daily oil that sinks in beautifully and leaves skin glowing.",
    details: "Fast-absorbing • warm scent notes",
    sortOrder: 1,
    stockQuantity: 8,
  },
  {
    id: "mock-3",
    name: "Glow Balm",
    price: "$16",
    description:
      "A rich rescue balm for cuticles, elbows, heels, and extra-dry spots.",
    details: "Pocket size • concentrated moisture",
    sortOrder: 2,
    stockQuantity: 3,
  },
  {
    id: "mock-4",
    name: "Seasonal Bundle",
    price: "$42",
    description:
      "A giftable pairing of butter and oil for a complete body care ritual.",
    details: "Limited drop • bundled savings",
    sortOrder: 3,
    stockQuantity: 0,
  },
];
