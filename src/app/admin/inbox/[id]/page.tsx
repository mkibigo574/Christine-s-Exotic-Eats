import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendReply } from "../actions";
import { InquiryActionsBar } from "./InquiryActionsBar";
import { ReplyForm } from "./ReplyForm";

export const dynamic = "force-dynamic";

type InquiryItem = {
  category: string;
  size: string;
  unitPrice: number;
  qty: number;
  lineTotal: number;
};

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("cee_inquiries")
    .select(
      "id, name, email, phone, event_date, event_type, guests, delivery, delivery_time, address, notes, items, subtotal_ex_gst, status, created_at",
    )
    .eq("id", id)
    .single();
  if (!data) notFound();

  // Auto-mark new enquiries as read on open
  if (data.status === "new") {
    await supabase.from("cee_inquiries").update({ status: "read" }).eq("id", id);
  }

  const { data: replies } = await supabase
    .from("cee_inquiry_replies")
    .select("id, subject, body, sent_at")
    .eq("inquiry_id", id)
    .order("sent_at", { ascending: false });

  const items = (data.items as InquiryItem[]) ?? [];
  const replyAction = sendReply.bind(null, id);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <Link href="/admin/inbox" className="text-sm text-[var(--color-muted)] hover:underline">
          ← Back to inbox
        </Link>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-[var(--color-wine-deep)]">{data.name}</h1>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {data.email}
              {data.phone ? ` · ${data.phone}` : ""}
            </p>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">
              Received {new Date(data.created_at).toLocaleString("en-AU")} · status: {data.status}
            </p>
          </div>
          <InquiryActionsBar id={id} status={data.status} />
        </div>

        <section className="mt-6 card p-6 grid gap-3 text-sm">
          <Row label="Event date" value={data.event_date ?? "—"} />
          <Row label="Event type" value={data.event_type ?? "—"} />
          <Row label="Guests" value={data.guests ? String(data.guests) : "—"} />
          <Row label="Delivery / pick-up" value={data.delivery ?? "—"} />
          <Row label="Delivery / pick-up time" value={data.delivery_time ?? "—"} />
          <Row label="Address" value={data.address ?? "—"} />
        </section>

        {data.notes ? (
          <section className="mt-4 card p-6">
            <div className="text-overline">Notes from client</div>
            <p className="mt-2 whitespace-pre-wrap text-[var(--color-ink)] leading-relaxed">
              {data.notes}
            </p>
          </section>
        ) : null}

        <section className="mt-4 card p-6">
          <div className="text-overline">Requested items</div>
          {items.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              No specific items selected — see notes.
            </p>
          ) : (
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--color-muted)] text-xs uppercase tracking-wide">
                  <th className="py-2">Item</th>
                  <th className="py-2">Size</th>
                  <th className="py-2 text-right">Qty</th>
                  <th className="py-2 text-right">Unit</th>
                  <th className="py-2 text-right">Line total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)]">
                {items.map((it, i) => (
                  <tr key={i}>
                    <td className="py-2">{it.category}</td>
                    <td className="py-2">{it.size}</td>
                    <td className="py-2 text-right">{it.qty}</td>
                    <td className="py-2 text-right">${Number(it.unitPrice).toFixed(2)}</td>
                    <td className="py-2 text-right">${Number(it.lineTotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="pt-3 text-right text-overline">
                    Subtotal (ex GST)
                  </td>
                  <td className="pt-3 text-right font-display text-lg">
                    ${Number(data.subtotal_ex_gst).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </section>

        {replies && replies.length > 0 ? (
          <section className="mt-6">
            <h2 className="font-display text-xl text-[var(--color-wine-dark)]">Reply history</h2>
            <div className="mt-3 grid gap-3">
              {replies.map((r) => (
                <div key={r.id} className="card p-5">
                  <div className="text-xs text-[var(--color-muted)]">
                    Sent {new Date(r.sent_at).toLocaleString("en-AU")}
                  </div>
                  <div className="font-display text-lg text-[var(--color-wine-dark)] mt-1">
                    {r.subject}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-[var(--color-ink)] leading-relaxed">
                    {r.body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <aside className="lg:sticky lg:top-6 self-start">
        <div className="card p-6">
          <h2 className="font-display text-xl text-[var(--color-wine-dark)]">Reply by email</h2>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Goes to {data.email}. Marked as replied automatically.
          </p>
          <div className="mt-4">
            <ReplyForm
              action={replyAction}
              defaultSubject={`Re: Your enquiry — Christine's Exotic Eats`}
              defaultBody={`Hi ${data.name.split(" ")[0]},\n\nThanks for your enquiry. `}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-overline">{label}</span>
      <span className="text-[var(--color-ink)]">{value}</span>
    </div>
  );
}
