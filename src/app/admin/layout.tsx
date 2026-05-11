import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminNav } from "./AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Login page renders within this layout but skips the chrome.
  if (!user) return <>{children}</>;

  const { count: newCount } = await supabase
    .from("cee_inquiries")
    .select("*", { count: "exact", head: true })
    .eq("status", "new");

  return (
    <div className="min-h-screen bg-[var(--color-cream-soft)]">
      <AdminNav userEmail={user.email ?? ""} newInquiriesCount={newCount ?? 0} />

      <div className="lg:pl-72">
        {/* Brand ribbon strip */}
        <div
          aria-hidden
          className="h-1.5 w-full"
          style={{
            background:
              "linear-gradient(to right, var(--color-wine) 0%, var(--color-wine) 25%, var(--color-gold) 25%, var(--color-gold) 50%, var(--color-terracotta) 50%, var(--color-terracotta) 75%, var(--color-sage) 75%, var(--color-sage) 100%)",
          }}
        />
        <main className="mx-auto max-w-6xl px-6 lg:px-10 py-10">{children}</main>
      </div>
    </div>
  );
}
