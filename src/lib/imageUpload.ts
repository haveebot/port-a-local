/**
 * Shared upload helper — used by both /api/wheelhouse/library
 * (direct-to-library upload) and /api/wheelhouse/social/upload
 * (upload-from-post-card). Both call this so every uploaded image
 * lands in the library catalog regardless of entry point.
 */

import { put } from "@vercel/blob";
import {
  insertImage,
  type LibraryImage,
} from "@/data/image-library-store";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp"]);

export interface UploadValidation {
  ok: boolean;
  error?: string;
  detail?: string;
  status?: number;
}

export function validateUploadEnv(): UploadValidation {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      ok: false,
      error: "blob_not_configured",
      detail:
        "BLOB_READ_WRITE_TOKEN not set. Create a Blob store in the Vercel dashboard (Storage → Create Blob Store) and the token is auto-injected.",
      status: 503,
    };
  }
  return { ok: true };
}

export function validateFile(file: File): UploadValidation {
  if (!ALLOWED.has(file.type)) {
    return {
      ok: false,
      error: "unsupported_type",
      detail: `Got ${file.type}. Accepted: PNG, JPEG, WEBP.`,
      status: 415,
    };
  }
  if (file.size > MAX_BYTES) {
    return {
      ok: false,
      error: "file_too_large",
      detail: `Max ${MAX_BYTES} bytes; got ${file.size}.`,
      status: 413,
    };
  }
  return { ok: true };
}

function safeSlug(name: string): string {
  const dot = name.lastIndexOf(".");
  const stem = (dot > 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "img";
  const ext = dot > 0 ? name.slice(dot).toLowerCase() : "";
  return `${stem}${ext}`;
}

/**
 * Upload a file to Vercel Blob + insert into image library catalog.
 * Returns the LibraryImage row (which carries the public URL).
 */
export async function uploadAndCatalog(
  file: File,
  createdBy: string | null,
): Promise<{ ok: boolean; image?: LibraryImage; error?: string; status?: number }> {
  const stamp = Date.now();
  const path = `pal/library/${stamp}-${safeSlug(file.name)}`;
  let blobUrl: string;
  let pathname: string;
  try {
    const blob = await put(path, file, {
      access: "public",
      contentType: file.type,
    });
    blobUrl = blob.url;
    pathname = blob.pathname;
  } catch (err) {
    return {
      ok: false,
      error: `blob_upload_failed: ${err instanceof Error ? err.message : String(err)}`,
      status: 502,
    };
  }
  const image = await insertImage({
    url: blobUrl,
    pathname,
    filename: file.name,
    contentType: file.type,
    sizeBytes: file.size,
    createdBy,
  });
  return { ok: true, image };
}
