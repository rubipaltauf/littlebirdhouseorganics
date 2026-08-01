export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthday: string;
  consent: "Marketing opted in" | "Marketing not yet confirmed";
  status: string;
  lastContact: string;
  tags: string[];
  lastOrder: string;
};

export type Product = {
  id: string;
  name: string;
  price: string;
  description: string;
  details: string;
  sortOrder: number;
  stockQuantity: number;
};

export type InventoryTransaction = {
  id: string;
  productId: string;
  change: number;
  reason: string;
  note: string | null;
  createdAt: string;
};

