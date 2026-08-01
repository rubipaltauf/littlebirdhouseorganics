import { mockProducts } from "../data/mockProducts";
import type { InventoryTransaction, Product } from "../types";
import { hasSupabaseConfig, supabase } from "./supabase";

type ProductRow = {
  id: string;
  name: string;
  price: string;
  description: string;
  details: string;
  sort_order: number;
  stock_quantity: number;
  sale_price: number | null;
  sale_starts_at: string | null;
  sale_ends_at: string | null;
};

type TransactionRow = {
  id: string;
  product_id: string;
  change: number;
  reason: string;
  note: string | null;
  created_at: string;
};

function parsePrice(price: string): number {
  return parseFloat(price.replace(/[^0-9.]/g, "")) || 0;
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    priceNum: parsePrice(row.price),
    description: row.description,
    details: row.details,
    sortOrder: row.sort_order,
    stockQuantity: row.stock_quantity,
    salePrice: row.sale_price,
    saleStartsAt: row.sale_starts_at,
    saleEndsAt: row.sale_ends_at,
  };
}

function toTransaction(row: TransactionRow): InventoryTransaction {
  return {
    id: row.id,
    productId: row.product_id,
    change: row.change,
    reason: row.reason,
    note: row.note,
    createdAt: row.created_at,
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!hasSupabaseConfig || !supabase) {
    return mockProducts;
  }

  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, description, details, sort_order, stock_quantity, sale_price, sale_starts_at, sale_ends_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.warn("Unable to load products from Supabase, using mock data.", error);
    return mockProducts;
  }

  const rows = data as ProductRow[] | null;
  return rows && rows.length > 0 ? rows.map(toProduct) : mockProducts;
}

export type ProductInput = {
  name: string;
  price: string;
  description: string;
  details: string;
  sort_order?: number;
  stock_quantity?: number;
  sale_price?: number | null;
  sale_starts_at?: string | null;
  sale_ends_at?: string | null;
};

export async function createProduct(input: ProductInput): Promise<Product> {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase is not configured. Connect a Supabase project to manage products.");
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      name: input.name,
      price: input.price,
      description: input.description,
      details: input.details,
      sort_order: input.sort_order ?? 0,
      stock_quantity: input.stock_quantity ?? 0,
      sale_price: input.sale_price ?? null,
      sale_starts_at: input.sale_starts_at ?? null,
      sale_ends_at: input.sale_ends_at ?? null,
    })
    .select("id, name, price, description, details, sort_order, stock_quantity, sale_price, sale_starts_at, sale_ends_at")
    .single();

  if (error) throw error;

  const product = toProduct(data as ProductRow);

  // Log the initial stock as an inventory transaction if non-zero
  if (product.stockQuantity > 0) {
    await supabase.from("inventory_transactions").insert({
      product_id: product.id,
      change: product.stockQuantity,
      reason: "initial_stock",
      note: "Initial inventory on product creation",
    });
  }

  return product;
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase is not configured. Connect a Supabase project to manage products.");
  }

  const { data, error } = await supabase
    .from("products")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, name, price, description, details, sort_order, stock_quantity, sale_price, sale_starts_at, sale_ends_at")
    .single();

  if (error) throw error;
  return toProduct(data as ProductRow);
}

export async function deleteProduct(id: string): Promise<void> {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase is not configured. Connect a Supabase project to manage products.");
  }

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

/** Record an inventory movement and update the product's stock_quantity. */
export async function adjustInventory(
  productId: string,
  change: number,
  reason: string,
  note?: string,
): Promise<Product> {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase is not configured. Connect a Supabase project to manage inventory.");
  }

  // Fetch current stock
  const { data: current, error: fetchError } = await supabase
    .from("products")
    .select("stock_quantity")
    .eq("id", productId)
    .single();

  if (fetchError) throw fetchError;

  const newQty = Math.max(0, (current as { stock_quantity: number }).stock_quantity + change);

  // Update the product quantity
  const { data: updated, error: updateError } = await supabase
    .from("products")
    .update({ stock_quantity: newQty, updated_at: new Date().toISOString() })
    .eq("id", productId)
    .select("id, name, price, description, details, sort_order, stock_quantity")
    .single();

  if (updateError) throw updateError;

  // Log the transaction
  const { error: logError } = await supabase.from("inventory_transactions").insert({
    product_id: productId,
    change,
    reason,
    note: note ?? null,
  });

  if (logError) throw logError;

  return toProduct(updated as ProductRow);
}

/** Fetch the transaction history for a product, newest first. */
export async function getInventoryLog(productId: string): Promise<InventoryTransaction[]> {
  if (!hasSupabaseConfig || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("inventory_transactions")
    .select("id, product_id, change, reason, note, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.warn("Unable to load inventory log.", error);
    return [];
  }

  return (data as TransactionRow[] | null)?.map(toTransaction) ?? [];
}

/** Returns true if the product currently has an active sale price. */
export function isOnSale(product: Product): boolean {
  if (product.salePrice === null) return false;
  const now = new Date();
  if (product.saleStartsAt && new Date(product.saleStartsAt) > now) return false;
  if (product.saleEndsAt && new Date(product.saleEndsAt) < now) return false;
  return true;
}

/** Returns the price the customer should pay right now (sale or regular). */
export function getEffectivePrice(product: Product): {
  display: string;
  num: number;
  onSale: boolean;
} {
  if (isOnSale(product) && product.salePrice !== null) {
    const formatted = product.salePrice % 1 === 0
      ? `$${product.salePrice}`
      : `$${product.salePrice.toFixed(2)}`;
    return { display: formatted, num: product.salePrice, onSale: true };
  }
  return { display: product.price, num: product.priceNum, onSale: false };
}
