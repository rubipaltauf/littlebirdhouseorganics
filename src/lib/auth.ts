import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type ProfileInput = {
  fullName?: string;
  phone?: string;
  birthday?: string | null;
  marketingConsent?: boolean;
};

export async function signInWithPassword(email: string, password: string) {
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signUpWithPassword(
  email: string,
  password: string,
  profileInput?: ProfileInput,
) {
  if (!supabase) {
    throw new Error("Supabase is not configured yet.");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: profileInput?.fullName ?? "",
      },
    },
  });

  if (error) {
    throw error;
  }

  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        full_name: profileInput?.fullName ?? "",
        email,
        phone: profileInput?.phone ?? null,
        birthday: profileInput?.birthday ?? null,
        marketing_consent: profileInput?.marketingConsent ?? false,
      },
      { onConflict: "id" },
    );

    if (profileError) {
      throw profileError;
    }
  }

  return data;
}

export async function signOut() {
  if (!supabase) {
    return;
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getSession(): Promise<Session | null> {
  if (!supabase) {
    return null;
  }

  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getUser(): Promise<User | null> {
  if (!supabase) {
    return null;
  }

  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function hasAdminRole(userId: string): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  const { data, error } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

