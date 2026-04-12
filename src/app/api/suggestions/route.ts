import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

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

    // TODO: When Resend is live, send notification email to admin@portaransaslocal.com

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
