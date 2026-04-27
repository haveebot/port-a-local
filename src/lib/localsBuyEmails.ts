/**
 * PAL Locals — sell-mode purchase email cascade.
 *
 * Three emails fire when a customer completes a Stripe Checkout for a
 * sell-mode listing:
 *   1. Vendor: "you just sold X — here's how to reach the customer"
 *   2. Customer: receipt + what to expect from the vendor
 *   3. Admin: audit trail (so Winston sees every sale)
 *
 * All three are gated by `markLocalsPurchaseEmailsSent` in the calling
 * page so a refresh of the success page doesn't re-fire. If any
 * individual send fails we log + swallow — better to ship 2 of 3 than
 * abort the whole cascade.
 *
 * Vendor email falls back to admin@ when listing.vendorEmail is missing
 * (v1 — Winston manually relays until vendors wire their email in).
 */

import type { Listing } from "@/data/locals-types";
import type { LocalsPurchaseRecord } from "@/data/locals-store";
import { emailLayout } from "@/lib/emailLayout";

const SITE = "https://theportalocal.com";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fmt(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

async function sendViaResend(payload: {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  cc?: string[];
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[locals buy email] RESEND_API_KEY missing — skipping send");
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: payload.from,
        to: payload.to,
        ...(payload.cc ? { cc: payload.cc } : {}),
        ...(payload.replyTo ? { reply_to: payload.replyTo } : {}),
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[locals buy email] Resend non-200:", res.status, body);
    }
  } catch (err) {
    console.error("[locals buy email] send failed:", err);
  }
}

/* -------------------- Vendor: "you sold something" -------------------- */

export async function sendVendorSaleEmail(
  listing: Listing,
  purchase: LocalsPurchaseRecord,
): Promise<void> {
  // Fallback: route to admin if vendor email isn't on file. Winston
  // forwards manually until vendors fill in vendorEmail.
  const vendorEmail = listing.vendorEmail?.trim();
  const recipient = vendorEmail || "admin@theportalocal.com";
  const isFallback = !vendorEmail;

  const subject = isFallback
    ? `[Relay needed] ${listing.provider} sold ${listing.title} — ${fmt(purchase.vendorAmountCents)}`
    : `🛒 You sold ${listing.title} — ${fmt(purchase.vendorAmountCents)}`;

  const fallbackBanner = isFallback
    ? `<div style="background:#fef3c7; border:1px solid #fcd34d; padding:12px; border-radius:8px; margin-bottom:18px;">
         <p style="margin:0; font-size:13px; color:#92400e;">
           <strong>Heads up:</strong> ${escapeHtml(listing.provider)} doesn't have an email on file yet —
           Winston will forward this manually. Reply with their address to wire direct routing.
         </p>
       </div>`
    : "";

  const bodyHtml = `
    ${fallbackBanner}
    <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em; color: #C84A2C; margin: 0 0 4px; font-weight: 700;">
      You just sold something
    </p>
    <h1 style="margin: 0 0 12px; font-family: Georgia, serif; font-size: 26px; line-height: 1.2;">
      ${escapeHtml(listing.title)}
    </h1>
    <p style="margin: 0 0 20px; font-size: 15px; color: #1e3a5f;">
      A customer just paid for your listing. Here's how to reach them
      to coordinate ${listing.fulfillmentNote ? "fulfillment" : "shipping or pickup"}.
    </p>

    <div style="background:#f5f0e8; padding:14px 16px; border-radius:10px; margin-bottom:18px; border:1px solid #e5dcc7;">
      <p style="margin: 0 0 8px; font-size:11px; text-transform:uppercase; letter-spacing:0.15em; color:#7d6e5a; font-weight:bold;">
        Customer
      </p>
      <p style="margin: 4px 0;"><strong>Name:</strong> ${escapeHtml(purchase.customerName)}</p>
      <p style="margin: 4px 0;"><strong>Phone:</strong> <a href="tel:${escapeHtml(purchase.customerPhone.replace(/[^\d+]/g, ""))}" style="color:#e8656f;">${escapeHtml(purchase.customerPhone)}</a></p>
      <p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${escapeHtml(purchase.customerEmail)}" style="color:#e8656f;">${escapeHtml(purchase.customerEmail)}</a></p>
      ${
        purchase.customerMessage
          ? `<p style="margin: 10px 0 4px; padding-top: 10px; border-top: 1px dashed #d4c8a8;"><strong>Message:</strong></p>
             <p style="margin: 4px 0; white-space: pre-wrap; font-style: italic; color: #4a5a73;">${escapeHtml(purchase.customerMessage)}</p>`
          : ""
      }
    </div>

    <div style="background:#ecfdf5; padding:14px 16px; border-radius:10px; margin-bottom:18px; border:1px solid #6ee7b7;">
      <p style="margin: 0 0 8px; font-size:11px; text-transform:uppercase; letter-spacing:0.15em; color:#047857; font-weight:bold;">
        Your payout
      </p>
      <p style="margin: 4px 0; font-size: 22px; font-weight: 700; color: #047857; font-family: 'SF Mono', Menlo, monospace;">
        ${fmt(purchase.vendorAmountCents)}
      </p>
      <p style="margin: 4px 0; font-size: 12px; color: #065f46;">
        ${
          listing.stripeAccountId
            ? "Transferred to your Stripe Connect account on payment capture."
            : "PAL collected the payment. We'll route your payout once your Stripe Connect account is set up — reply to wire it."
        }
      </p>
    </div>

    ${
      listing.fulfillmentNote
        ? `<div style="background:#fff5f0; padding:14px 16px; border-radius:10px; margin-bottom:18px; border:1px solid #fde0d4;">
             <p style="margin: 0 0 8px; font-size:11px; text-transform:uppercase; letter-spacing:0.15em; color:#C84A2C; font-weight:bold;">
               Your fulfillment plan
             </p>
             <p style="margin: 4px 0; font-style: italic;">${escapeHtml(listing.fulfillmentNote)}</p>
           </div>`
        : ""
    }

    <p style="margin: 20px 0 6px; font-size: 14px;"><strong>Next:</strong></p>
    <ul style="margin: 0 0 8px; padding-left: 22px; font-size: 14px; line-height: 1.7;">
      <li>Reach out to the customer in the next 24 hours.</li>
      <li>Coordinate ${listing.fulfillmentNote ? "the plan you set" : "shipping or pickup"}.</li>
      <li>Reply to this email if anything's off — we'll handle it.</li>
    </ul>

    <p style="margin-top: 24px; font-size: 12px; color: #8896ab;">
      Order ID: <code>${escapeHtml(purchase.stripeSessionId)}</code><br/>
      Listing: <a href="${SITE}/locals#${escapeHtml(listing.id)}" style="color:#e8656f;">${escapeHtml(listing.title)} on /locals</a>
    </p>

    <p style="margin-top: 28px; font-size: 14px; color: #1e3a5f;">
      — The Port A Local
    </p>
  `;

  const text = [
    `You just sold ${listing.title} — ${fmt(purchase.vendorAmountCents)}`,
    "",
    `Customer: ${purchase.customerName}`,
    `Phone: ${purchase.customerPhone}`,
    `Email: ${purchase.customerEmail}`,
    purchase.customerMessage ? `\nMessage:\n${purchase.customerMessage}` : "",
    "",
    `Your payout: ${fmt(purchase.vendorAmountCents)}`,
    listing.stripeAccountId
      ? "Transferred to your Stripe Connect account."
      : "PAL is holding payout — reply to wire your Stripe Connect.",
    "",
    listing.fulfillmentNote
      ? `Your fulfillment plan: ${listing.fulfillmentNote}`
      : "",
    "",
    "Reach out to the customer in the next 24 hours to coordinate.",
    "",
    `Order: ${purchase.stripeSessionId}`,
    `Listing: ${SITE}/locals#${listing.id}`,
    "",
    "— The Port A Local",
  ]
    .filter(Boolean)
    .join("\n");

  await sendViaResend({
    from: "PAL Locals <orders@theportalocal.com>",
    to: [recipient],
    // CC admin on every vendor sale — audit trail + cover for vendor
    // who misses their email.
    cc: isFallback ? undefined : ["admin@theportalocal.com"],
    replyTo: purchase.customerEmail,
    subject,
    html: emailLayout({
      preheader: `${listing.title} — ${fmt(purchase.vendorAmountCents)} sale via PAL Locals`,
      bodyHtml,
    }),
    text,
  });
}

/* -------------------- Customer: "thanks, here's what's next" -------------------- */

export async function sendCustomerSaleEmail(
  listing: Listing,
  purchase: LocalsPurchaseRecord,
): Promise<void> {
  const subject = `Order placed — ${listing.title} from ${listing.provider}`;

  const bodyHtml = `
    <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.15em; color: #047857; margin: 0 0 4px; font-weight: 700;">
      Order placed ✓
    </p>
    <h1 style="margin: 0 0 12px; font-family: Georgia, serif; font-size: 26px; line-height: 1.2;">
      ${escapeHtml(listing.title)}
    </h1>
    <p style="margin: 0 0 20px; font-size: 15px; color: #1e3a5f;">
      Thanks, ${escapeHtml(purchase.customerName.split(" ")[0] || purchase.customerName)} —
      <strong>${escapeHtml(listing.provider)}</strong> got your order and will reach out
      directly to coordinate ${listing.fulfillmentNote ? "fulfillment" : "shipping or pickup"}.
      PAL is just the booking layer.
    </p>

    ${
      listing.fulfillmentNote
        ? `<div style="background:#fff5f0; padding:14px 16px; border-radius:10px; margin-bottom:18px; border:1px solid #fde0d4;">
             <p style="margin: 0 0 8px; font-size:11px; text-transform:uppercase; letter-spacing:0.15em; color:#C84A2C; font-weight:bold;">
               How you'll get it
             </p>
             <p style="margin: 4px 0; font-style: italic;">${escapeHtml(listing.fulfillmentNote)}</p>
           </div>`
        : ""
    }

    <div style="background:#f5f0e8; padding:14px 16px; border-radius:10px; margin-bottom:18px; border:1px solid #e5dcc7;">
      <p style="margin: 0 0 8px; font-size:11px; text-transform:uppercase; letter-spacing:0.15em; color:#7d6e5a; font-weight:bold;">
        Receipt
      </p>
      <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%; font-size:14px;">
        <tr><td style="padding: 3px 0;">Item</td><td style="padding: 3px 0; text-align: right; font-family: 'SF Mono', Menlo, monospace;">${fmt(purchase.vendorAmountCents)}</td></tr>
        <tr><td style="padding: 3px 0;">PAL platform fee (10%)</td><td style="padding: 3px 0; text-align: right; font-family: 'SF Mono', Menlo, monospace;">${fmt(purchase.palFeeCents)}</td></tr>
        <tr><td colspan="2" style="padding: 4px 0;"><div style="border-top: 1px dashed #d4c8a8;"></div></td></tr>
        <tr><td style="padding: 3px 0; font-weight: 700;">Total charged</td><td style="padding: 3px 0; text-align: right; font-family: 'SF Mono', Menlo, monospace; font-weight: 700;">${fmt(purchase.totalCents)}</td></tr>
      </table>
    </div>

    <p style="margin: 16px 0 6px; font-size: 14px;"><strong>What happens next:</strong></p>
    <ol style="margin: 0 0 8px; padding-left: 22px; font-size: 14px; line-height: 1.7;">
      <li>${escapeHtml(listing.provider)} reaches out directly (usually within a day).</li>
      <li>You coordinate ${listing.fulfillmentNote ? "based on their fulfillment plan above" : "shipping or pickup"}.</li>
      <li>If anything's off, reply to this email — we'll make it right.</li>
    </ol>

    <p style="margin-top: 24px; font-size: 12px; color: #8896ab;">
      Order ID: <code>${escapeHtml(purchase.stripeSessionId)}</code>
    </p>

    <p style="margin-top: 28px; font-size: 14px; color: #1e3a5f;">
      — The Port A Local
    </p>
  `;

  const text = [
    `Order placed — ${listing.title} from ${listing.provider}`,
    "",
    `Thanks, ${purchase.customerName}.`,
    `${listing.provider} got your order and will reach out to coordinate.`,
    "",
    listing.fulfillmentNote ? `How you'll get it: ${listing.fulfillmentNote}` : "",
    "",
    "Receipt:",
    `  Item:                    ${fmt(purchase.vendorAmountCents)}`,
    `  PAL platform fee (10%):  ${fmt(purchase.palFeeCents)}`,
    `  Total charged:           ${fmt(purchase.totalCents)}`,
    "",
    `Order ID: ${purchase.stripeSessionId}`,
    "",
    "Reply to this email if anything's off.",
    "",
    "— The Port A Local",
  ]
    .filter(Boolean)
    .join("\n");

  await sendViaResend({
    from: "PAL Locals <orders@theportalocal.com>",
    to: [purchase.customerEmail],
    replyTo: "hello@theportalocal.com",
    subject,
    html: emailLayout({
      preheader: `${listing.provider} will reach out to coordinate. Total: ${fmt(purchase.totalCents)}`,
      bodyHtml,
    }),
    text,
  });
}

/* -------------------- Admin: "sale closed" audit -------------------- */

export async function sendAdminSaleEmail(
  listing: Listing,
  purchase: LocalsPurchaseRecord,
): Promise<void> {
  const vendorRouted = !!listing.vendorEmail;
  const subject = `🛒 Locals sale — ${listing.provider} · ${listing.title} · ${fmt(purchase.totalCents)}`;

  const bodyHtml = `
    <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #C84A2C; margin: 0 0 4px; font-weight: 700;">
      PAL Locals · Sale closed
    </p>
    <h2 style="margin: 0 0 12px; font-family: Georgia, serif; font-size: 22px;">
      ${escapeHtml(listing.title)} → ${escapeHtml(purchase.customerName)}
    </h2>

    <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%; font-size:14px; margin: 12px 0 18px;">
      <tr><td style="padding: 4px 0; color: #7d6e5a;">Vendor</td><td style="padding: 4px 0; text-align: right;">${escapeHtml(listing.provider)}</td></tr>
      <tr><td style="padding: 4px 0; color: #7d6e5a;">Vendor email</td><td style="padding: 4px 0; text-align: right;">${vendorRouted ? escapeHtml(listing.vendorEmail!) : "<em>(not on file — fallback fired)</em>"}</td></tr>
      ${listing.vendorPhone ? `<tr><td style="padding: 4px 0; color: #7d6e5a;">Vendor phone</td><td style="padding: 4px 0; text-align: right;">${escapeHtml(listing.vendorPhone)}</td></tr>` : ""}
      <tr><td style="padding: 4px 0; color: #7d6e5a;">Customer</td><td style="padding: 4px 0; text-align: right;">${escapeHtml(purchase.customerName)}</td></tr>
      <tr><td style="padding: 4px 0; color: #7d6e5a;">Customer email</td><td style="padding: 4px 0; text-align: right;">${escapeHtml(purchase.customerEmail)}</td></tr>
      <tr><td style="padding: 4px 0; color: #7d6e5a;">Customer phone</td><td style="padding: 4px 0; text-align: right;">${escapeHtml(purchase.customerPhone)}</td></tr>
      <tr><td colspan="2" style="padding: 4px 0;"><div style="border-top: 1px dashed #d4c8a8;"></div></td></tr>
      <tr><td style="padding: 4px 0; color: #7d6e5a;">Vendor payout</td><td style="padding: 4px 0; text-align: right; font-family: 'SF Mono', Menlo, monospace;">${fmt(purchase.vendorAmountCents)}</td></tr>
      <tr><td style="padding: 4px 0; color: #047857;">PAL fee (kept)</td><td style="padding: 4px 0; text-align: right; font-family: 'SF Mono', Menlo, monospace; color: #047857;">${fmt(purchase.palFeeCents)}</td></tr>
      <tr><td style="padding: 4px 0; font-weight: 700;">Total charged</td><td style="padding: 4px 0; text-align: right; font-family: 'SF Mono', Menlo, monospace; font-weight: 700;">${fmt(purchase.totalCents)}</td></tr>
    </table>

    ${
      purchase.customerMessage
        ? `<div style="background:#fff5f0; padding:12px 14px; border-radius:8px; margin: 12px 0 18px; border:1px solid #fde0d4;">
             <p style="margin: 0 0 6px; font-size:11px; text-transform:uppercase; letter-spacing:0.15em; color:#C84A2C; font-weight:bold;">Customer message</p>
             <p style="margin: 4px 0; white-space: pre-wrap; font-style: italic;">${escapeHtml(purchase.customerMessage)}</p>
           </div>`
        : ""
    }

    <p style="font-size: 12px; color: #555; margin: 18px 0 6px;">
      <strong>Routing status:</strong>
      ${
        vendorRouted
          ? "Vendor notified directly. Admin CC'd."
          : "<strong style='color:#C84A2C;'>Vendor email missing — Winston needs to forward.</strong>"
      }
      ${
        listing.stripeAccountId
          ? "Stripe Connect transfer fired automatically."
          : "<strong style='color:#C84A2C;'>No Connect account — payout is held in PAL Stripe.</strong>"
      }
    </p>

    <p style="font-size: 11px; color: #888;">
      Order: <code>${escapeHtml(purchase.stripeSessionId)}</code><br/>
      Listing: <code>${escapeHtml(listing.id)}</code>
    </p>
  `;

  const text =
    `Locals sale closed — ${listing.title} → ${purchase.customerName} (${fmt(purchase.totalCents)})\n\n` +
    `Vendor: ${listing.provider} (${vendorRouted ? listing.vendorEmail : "no email — fallback"})\n` +
    `Customer: ${purchase.customerName} · ${purchase.customerEmail} · ${purchase.customerPhone}\n\n` +
    `Vendor payout: ${fmt(purchase.vendorAmountCents)}\n` +
    `PAL fee:       ${fmt(purchase.palFeeCents)}\n` +
    `Total:         ${fmt(purchase.totalCents)}\n\n` +
    (purchase.customerMessage ? `Message:\n${purchase.customerMessage}\n\n` : "") +
    `Order: ${purchase.stripeSessionId}\nListing: ${listing.id}`;

  await sendViaResend({
    from: "PAL Locals <orders@theportalocal.com>",
    to: ["admin@theportalocal.com", "hello@theportalocal.com"],
    replyTo: purchase.customerEmail,
    subject,
    html: emailLayout({
      preheader: `Sale: ${listing.title} → ${purchase.customerName} · ${fmt(purchase.totalCents)}`,
      bodyHtml,
    }),
    text,
  });
}
