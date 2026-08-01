import type { Customer } from "../types";

export const mockCustomers: Customer[] = [
  {
    id: "cust-1001",
    full_name: "Avery Morgan",
    name: "Avery Morgan",
    email: "avery@example.com",
    phone: "(555) 010-1001",
    birthday: "1990-04-18",
    consent: "Marketing opted in",
    status: "VIP",
    lastContact: "2026-07-31",
    tags: ["VIP", "Birthday promo"],
    lastOrder: "2026-07-21",
  },
  {
    id: "cust-1002",
    full_name: "Jordan Lee",
    name: "Jordan Lee",
    email: "jordan@example.com",
    phone: "(555) 010-1002",
    birthday: "1988-09-03",
    consent: "Marketing not yet confirmed",
    status: "Prospect",
    lastContact: "2026-07-29",
    tags: ["New lead"],
    lastOrder: "2026-07-29",
  },
  {
    id: "cust-1003",
    full_name: "Taylor Reed",
    name: "Taylor Reed",
    email: "taylor@example.com",
    phone: "(555) 010-1003",
    birthday: "1994-12-12",
    consent: "Marketing opted in",
    status: "Active",
    lastContact: "2026-07-30",
    tags: ["Repeat buyer", "Wholesale"],
    lastOrder: "2026-07-30",
  },
];

