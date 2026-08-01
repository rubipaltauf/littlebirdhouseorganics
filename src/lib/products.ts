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
};

type TransactionRow = {
  id: string;
  product_id: string;
  change: number;
  reason: string;
  note: string | null;
  created_at: string;
};

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    description: row.description,
    details: row.details,
    sortOrder: row.sort_order,
    stockQuantity: row.stock_quantity,
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
    .select("id, name, price, description, details, sort_order, stock_quantity")
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
    })
    .select("id, name, price, description, details, sort_order, stock_quantity")
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
    .select("id, name, price, description, details, sort_order, stock_quantity")
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
