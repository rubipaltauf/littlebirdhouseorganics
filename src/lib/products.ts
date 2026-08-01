import { mockProducts } from "../data/mockProducts";
import type { Product } from "../types";
import { hasSupabaseConfig, supabase } from "./supabase";

type ProductRow = {
  id: string;
  name: string;
  price: string;
  description: string;
  details: string;
  sort_order: number;
};

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    description: row.description,
    details: row.details,
    sortOrder: row.sort_order,
  };
}

export async function getProducts(): Promise<Product[]> {
  if (!hasSupabaseConfig || !supabase) {
    return mockProducts;
  }

  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, description, details, sort_order")
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
    })
    .select("id, name, price, description, details, sort_order")
    .single();

  if (error) throw error;
  return toProduct(data as ProductRow);
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase is not configured. Connect a Supabase project to manage products.");
  }

  const { data, error } = await supabase
    .from("products")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, name, price, description, details, sort_order")
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
