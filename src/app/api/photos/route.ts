import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const PHOTOS_FILE = path.join(process.cwd(), "data", "photos.json");

export interface PhotoSubmission {
  id: string;
  caption: string;
  tags: string[];
  submittedBy: string;
  timestamp: string;
  status: "pending" | "approved" | "dismissed";
  /** Base64 data URL — stored temporarily. In production, use cloud storage. */
  imageData?: string;
  /** After approval, a hosted URL replaces imageData */
  imageUrl?: string;
}

async function readPhotos(): Promise<PhotoSubmission[]> {
  try {
    const data = await fs.readFile(PHOTOS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writePhotos(photos: PhotoSubmission[]): Promise<void> {
  await fs.mkdir(path.dirname(PHOTOS_FILE), { recursive: true });
  await fs.writeFile(PHOTOS_FILE, JSON.stringify(photos, null, 2));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { caption, tags, submittedBy, imageData } = body;

    if (!caption?.trim() && !imageData) {
      return NextResponse.json({ error: "Missing caption or image" }, { status: 400 });
    }

    const photos = await readPhotos();

    const newPhoto: PhotoSubmission = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      caption: caption?.trim() || "",
      tags: tags || [],
      submittedBy: submittedBy?.trim() || "Anonymous",
      timestamp: new Date().toISOString(),
      status: "pending",
      imageData: imageData || undefined,
    };

    photos.push(newPhoto);
    await writePhotos(photos);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const photos = await readPhotos();
    // Only return approved photos for public gallery (strip imageData for size)
    const approved = photos
      .filter((p) => p.status === "approved")
      .map(({ imageData, ...rest }) => rest);
    return NextResponse.json(approved);
  } catch {
    return NextResponse.json({ error: "Failed to read photos" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !["approved", "dismissed"].includes(status)) {
      return NextResponse.json({ error: "Invalid id or status" }, { status: 400 });
    }

    const photos = await readPhotos();
    const idx = photos.findIndex((p) => p.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    photos[idx].status = status;
    await writePhotos(photos);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
