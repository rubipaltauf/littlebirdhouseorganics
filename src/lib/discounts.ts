import type { DiscountCode } from "../types";
import { hasSupabaseConfig, supabase } from "./supabase";

type DiscountRow = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_order: number;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  is_active: boolean;
  trigger_type: "manual" | "birthday";
  assigned_to: string | null;
  created_at: string;
};

function toDiscount(row: DiscountRow): DiscountCode {
  return {
    id: row.id,
    code: row.code,
    type: row.type,
    value: row.value,
    minOrder: row.min_order,
    maxUses: row.max_uses,
    usesCount: row.uses_count,
    expiresAt: row.expires_at,
    isActive: row.is_active,
    triggerType: row.trigger_type,
    assignedTo: row.assigned_to,
    createdAt: row.created_at,
  };
}

// Unambiguous uppercase chars — no 0/O, 1/I/L confusion
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Generate a random discount code string of the given length (default 6). */
export function generateCodeString(length = 6): string {
  return Array.from(
    { length },
    () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)],
  ).join("");
}

export type DiscountInput = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_order?: number;
  max_uses?: number | null;
  expires_at?: string | null;
  trigger_type?: "manual" | "birthday";
  assigned_to?: string | null;
};

/** Admin: create a new discount code. */
export async function createDiscountCode(input: DiscountInput): Promise<DiscountCode> {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabase
    .from("discount_codes")
    .insert({
      code: input.code.toUpperCase(),
      type: input.type,
      value: input.value,
      min_order: input.min_order ?? 0,
      max_uses: input.max_uses ?? null,
      expires_at: input.expires_at ?? null,
      trigger_type: input.trigger_type ?? "manual",
      assigned_to: input.assigned_to ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return toDiscount(data as DiscountRow);
}

/** Admin: list all discount codes. */
export async function listDiscountCodes(): Promise<DiscountCode[]> {
  if (!hasSupabaseConfig || !supabase) return [];

  const { data, error } = await supabase
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Unable to load discount codes.", error);
    return [];
  }

  return (data as DiscountRow[] | null)?.map(toDiscount) ?? [];
}

/** Admin: toggle a code's active state. */
export async function setDiscountActive(id: string, isActive: boolean): Promise<void> {
  if (!hasSupabaseConfig || !supabase) throw new Error("Supabase is not configured.");

  const { error } = await supabase
    .from("discount_codes")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) throw error;
}

export type ValidationResult =
  | { valid: true; discount: DiscountCode }
  | { valid: false; message: string };

/** Cart: validate a code against the public-readable active codes. */
export async function validateDiscountCode(
  code: string,
  cartTotal: number,
): Promise<ValidationResult> {
  if (!hasSupabaseConfig || !supabase) {
    // Dev fallback: accept WELCOME10 (10% off) and SAVE5 ($5 off)
    const upper = code.toUpperCase();
    if (upper === "WELCOME10") {
      return {
        valid: true,
        discount: {
          id: "mock-1", code: "WELCOME10", type: "percent", value: 10,
          minOrder: 0, maxUses: null, usesCount: 0, expiresAt: null,
          isActive: true, triggerType: "manual", assignedTo: null, createdAt: "",
        },
      };
    }
    if (upper === "SAVE5") {
      return {
        valid: true,
        discount: {
          id: "mock-2", code: "SAVE5", type: "fixed", value: 5,
          minOrder: 0, maxUses: null, usesCount: 0, expiresAt: null,
          isActive: true, triggerType: "manual", assignedTo: null, createdAt: "",
        },
      };
    }
    return { valid: false, message: "Code not found." };
  }

  const { data, error } = await supabase
    .from("discount_codes")
    .select("*")
    .eq("code", code.toUpperCase())
    .maybeSingle();

  if (error) return { valid: false, message: "Unable to validate code." };
  if (!data) return { valid: false, message: "Code not found." };

  const row = data as DiscountRow;

  if (!row.is_active) return { valid: false, message: "This code is no longer active." };
  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return { valid: false, message: "This code has expired." };
  }
  if (row.max_uses !== null && row.uses_count >= row.max_uses) {
    return { valid: false, message: "This code has reached its usage limit." };
  }
  if (cartTotal < row.min_order) {
    return {
      valid: false,
      message: `This code requires a minimum order of $${row.min_order.toFixed(2)}.`,
    };
  }

  return { valid: true, discount: toDiscount(row) };
}

/** Compute how much a discount saves on a given cart total. */
export function computeDiscount(discount: DiscountCode, cartTotal: number): number {
  if (discount.type === "percent") {
    return Math.min(cartTotal, (cartTotal * discount.value) / 100);
  }
  return Math.min(cartTotal, discount.value);
}
