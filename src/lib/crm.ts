import { mockCustomers } from "../data/mockCrm";
import type { Customer } from "../types";
import { hasSupabaseConfig, supabase } from "./supabase";

type CustomerRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  birthday: string | null;
  marketing_consent: boolean | null;
  customer_status: string | null;
  last_contact: string | null;
};

function toCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    full_name: row.full_name || row.email || "Unnamed customer",
    name: row.full_name || row.email || "Unnamed customer",
    email: row.email || "",
    phone: row.phone || "",
    birthday: row.birthday || "",
    consent: row.marketing_consent ? "Marketing opted in" : "Marketing not yet confirmed",
    status: row.customer_status || "Prospect",
    lastContact: row.last_contact || "",
    tags: [],
    lastOrder: "",
  };
}

export async function getCustomers(): Promise<Customer[]> {
  if (!hasSupabaseConfig || !supabase) {
    return mockCustomers;
  }

  const { data, error } = await supabase
    .from("customers")
    .select("id, full_name, email, phone, birthday, marketing_consent, customer_status, last_contact")
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Unable to load customers from Supabase, falling back to mock data.", error);
    return mockCustomers;
  }

  const customers = (data as CustomerRow[] | null)?.map(toCustomer) ?? mockCustomers;

  return Promise.all(
    customers.map(async (customer) => ({
      ...customer,
      tags: await getCustomerTags(customer.id),
    })),
  );
}

export async function getCustomer(customerId: string): Promise<Customer | null> {
  if (!hasSupabaseConfig || !supabase) {
    return mockCustomers.find((c) => c.id === customerId) ?? null;
  }

  const { data, error } = await supabase
    .from("customers")
    .select("id, full_name, email, phone, birthday, marketing_consent, customer_status, last_contact")
    .eq("id", customerId)
    .maybeSingle();

  if (error) {
    console.warn("Unable to load customer from Supabase.", error);
    return mockCustomers.find((c) => c.id === customerId) ?? null;
  }

  return data ? toCustomer(data as CustomerRow) : null;
}

export async function getCustomerTags(customerId: string): Promise<string[]> {
  if (!hasSupabaseConfig || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("customer_tags")
    .select("tag")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Unable to load customer tags from Supabase.", error);
    return [];
  }

  return (data ?? []).map((entry) => entry.tag).filter(Boolean);
}

export async function getCustomerNotes(customerId: string): Promise<Array<{ id: string; note: string }>> {
  if (!hasSupabaseConfig || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("customer_notes")
    .select("id, note")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Unable to load customer notes from Supabase.", error);
    return [];
  }

  return (data ?? []).map((entry) => ({ id: entry.id, note: entry.note })).filter(Boolean);
}

export async function createCustomerNote(customerId: string, note: string) {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { error } = await supabase.from("customer_notes").insert({ customer_id: customerId, note });
  if (error) throw error;
}

export async function updateCustomerNote(noteId: string, note: string) {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { error } = await supabase.from("customer_notes").update({ note }).eq("id", noteId);
  if (error) throw error;
}

export async function deleteCustomerNote(noteId: string) {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { error } = await supabase.from("customer_notes").delete().eq("id", noteId);
  if (error) throw error;
}

export async function getCustomerTagRows(customerId: string): Promise<Array<{ id: string; tag: string }>> {
  if (!hasSupabaseConfig || !supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("customer_tags")
    .select("id, tag")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Unable to load customer tags from Supabase.", error);
    return [];
  }

  return (data ?? []).map((entry) => ({ id: entry.id, tag: entry.tag })).filter(Boolean);
}

export async function createCustomer(customer: {
  full_name: string;
  email: string;
  phone?: string | null;
  birthday?: string | null;
  marketing_consent?: boolean;
  customer_status?: string;
  last_contact?: string | null;
}) {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabase
    .from("customers")
    .insert({
      full_name: customer.full_name,
      email: customer.email,
      phone: customer.phone ?? null,
      birthday: customer.birthday ?? null,
      marketing_consent: Boolean(customer.marketing_consent),
      customer_status: customer.customer_status ?? "Prospect",
      last_contact: customer.last_contact ?? null,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

export async function updateCustomer(customerId: string, customer: {
  full_name: string;
  email: string;
  phone?: string | null;
  birthday?: string | null;
  marketing_consent?: boolean;
  customer_status?: string;
  last_contact?: string | null;
}) {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { error } = await supabase
    .from("customers")
    .update({
      full_name: customer.full_name,
      email: customer.email,
      phone: customer.phone ?? null,
      birthday: customer.birthday ?? null,
      marketing_consent: Boolean(customer.marketing_consent),
      customer_status: customer.customer_status ?? "Prospect",
      last_contact: customer.last_contact ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", customerId);

  if (error) throw error;
}

export async function createCustomerTag(customerId: string, tag: string) {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { error } = await supabase.from("customer_tags").insert({ customer_id: customerId, tag });
  if (error) throw error;
}

export async function updateCustomerTag(tagId: string, tag: string) {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { error } = await supabase.from("customer_tags").update({ tag }).eq("id", tagId);
  if (error) throw error;
}

export async function deleteCustomerTag(tagId: string) {
  if (!hasSupabaseConfig || !supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { error } = await supabase.from("customer_tags").delete().eq("id", tagId);
  if (error) throw error;
}
