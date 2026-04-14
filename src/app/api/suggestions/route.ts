import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { emailLayout } from "@/lib/emailLayout";

const RESEND_KEY = process.env.RESEND_API_KEY;
const SUGGESTIONS_FILE = path.join(process.cwd(), "data", "suggestions.json");

interface Suggestion {
  id: string;
  businessSlug: string;
  businessName: string;
  selectedTags: string[];
  customNote: string;
  timestamp: string;
  status: "pending" | "approved" | "dismissed";
}

async function sendNotificationEmail(suggestion: Suggestion) {
  if (!RESEND_KEY) {
    console.log("[Email] Resend not configured — would notify admin about suggestion for", suggestion.businessName);
    return;
  }

  const tagList = suggestion.selectedTags.length
    ? suggestion.selectedTags.map((t) => `<li>${t}</li>`).join("")
    : "<li><em>None</em></li>";

  const html = emailLayout({
    preheader: `New tag suggestion for ${suggestion.businessName}`,
    bodyHtml: `
      <h2 style="margin:0 0 8px 0; font-size:20px; color:#0b1120;">New Tag Suggestion</h2>
      <p style="margin:0 0 16px 0; color:#4a5568; font-size:13px;">Review in the admin queue.</p>
      <p><strong>Business:</strong> ${suggestion.businessName} <span style="color:#8896ab; font-family:monospace; font-size:12px;">(${suggestion.businessSlug})</span></p>
      <p><strong>Suggested tags:</strong></p>
      <ul>${tagList}</ul>
      ${suggestion.customNote ? `<p><strong>Custom note:</strong> ${suggestion.customNote}</p>` : ""}
      <p style="color:#8896ab; font-size:12px; margin-top:12px;">Submitted ${new Date(suggestion.timestamp).toLocaleString()}</p>
    `,
    cta: { label: "Open admin queue", href: "https://theportalocal.com/admin/suggestions" },
  });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Port A Local <bookings@theportalocal.com>",
      to: "admin@theportalocal.com",
      subject: `Tag Suggestion: ${suggestion.businessName}`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[Email] Resend error:", err);
  }
}

async function readSuggestions(): Promise<Suggestion[]> {
  try {
    const data = await fs.readFile(SUGGESTIONS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeSuggestions(suggestions: Suggestion[]): Promise<void> {
  await fs.mkdir(path.dirname(SUGGESTIONS_FILE), { recursive: true });
  await fs.writeFile(SUGGESTIONS_FILE, JSON.stringify(suggestions, null, 2));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { businessSlug, businessName, selectedTags, customNote } = body;

    if (!businessSlug || (!selectedTags?.length && !customNote?.trim())) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const suggestions = await readSuggestions();

    const newSuggestion: Suggestion = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      businessSlug,
      businessName,
      selectedTags: selectedTags || [],
      customNote: customNote || "",
      timestamp: new Date().toISOString(),
      status: "pending",
    };

    suggestions.push(newSuggestion);
    await writeSuggestions(suggestions);

    // Fire-and-forget: don't block the response on email delivery
    sendNotificationEmail(newSuggestion).catch((err) =>
      console.error("[Email] Failed to send suggestion notification:", err)
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const suggestions = await readSuggestions();
    return NextResponse.json(suggestions);
  } catch {
    return NextResponse.json(
      { error: "Failed to read suggestions" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !["approved", "dismissed"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid id or status" },
        { status: 400 }
      );
    }

    const suggestions = await readSuggestions();
    const idx = suggestions.findIndex((s) => s.id === id);

    if (idx === -1) {
      return NextResponse.json(
        { error: "Suggestion not found" },
        { status: 404 }
      );
    }

    suggestions[idx].status = status;
    await writeSuggestions(suggestions);

    return NextResponse.json({ success: true, suggestion: suggestions[idx] });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
