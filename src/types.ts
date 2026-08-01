export type Customer = {
  id: string;
  name: string;
  full_name: string;
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
  price: string;       // display string, e.g. "$28"
  priceNum: number;    // numeric value, e.g. 28
  description: string;
  details: string;
  sortOrder: number;
  stockQuantity: number;
  salePrice: number | null;      // numeric sale price, e.g. 22
  saleStartsAt: string | null;   // ISO timestamp; null = active immediately
  saleEndsAt: string | null;     // ISO timestamp; null = no expiry
};

export type InventoryTransaction = {
  id: string;
  productId: string;
  change: number;
  reason: string;
  note: string | null;
  createdAt: string;
};

export type DiscountCode = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder: number;
  maxUses: number | null;
  usesCount: number;
  expiresAt: string | null;
  isActive: boolean;
  triggerType: "manual" | "birthday";
  assignedTo: string | null;
  createdAt: string;
};

