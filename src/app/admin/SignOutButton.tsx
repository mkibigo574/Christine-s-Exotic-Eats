"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={signOut}
      className="text-sm text-[var(--color-wine)] hover:text-[var(--color-wine-dark)] transition"
    >
      Sign out
    </button>
  );
}
