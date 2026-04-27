/**
 * QR code generator for email magic-links — cross-device sign-in.
 *
 * Why: a magic-link in an email solves "sign in once" but assumes the
 * runner is reading email on the same device they want signed-in. The
 * common failure: reading email on desktop, want to sign in on phone.
 * Forwarding/screenshotting is friction. A QR encoding the same link
 * lets them scan with phone camera → signed in on phone in 5 seconds.
 *
 * Returns a base64 data URL so the QR embeds inline in email HTML
 * without needing a hosted image endpoint. Email clients that support
 * data: URLs (Gmail, Apple Mail, Outlook) render it natively. Strict
 * clients fall back to the link button — the QR is supplementary.
 */

import QRCode from "qrcode";

export interface QrEmailOptions {
  /** Pixel size for the QR. 256 hits the sweet spot for both desktop
      preview rendering AND phone-camera scanning distance. */
  size?: number;
  /** Error correction level: H = 30% data redundancy, lets the QR
      still scan even with the lighthouse-icon overlay or partial blur. */
  errorCorrection?: "L" | "M" | "Q" | "H";
}

/**
 * Generate a QR code as a base64-encoded PNG data URL, ready to drop
 * into an `<img src="...">` tag in email HTML.
 *
 * Returns null if generation fails — caller should still render the
 * link button as the primary path.
 */
export async function magicLinkQrDataUrl(
  url: string,
  opts: QrEmailOptions = {},
): Promise<string | null> {
  if (!url || url.length < 10) return null;
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: opts.size ?? 256,
      margin: 1,
      // Navy + sand colors match PAL palette so the QR feels intentional
      // rather than a generic black square pasted into the email.
      color: { dark: "#1a2433", light: "#fdfaf3" },
      errorCorrectionLevel: opts.errorCorrection ?? "M",
    });
    return dataUrl;
  } catch (err) {
    console.error("[qrEmail] generation failed:", err);
    return null;
  }
}

/**
 * Standard inline-QR HTML block for emails. Keeps the markup
 * consistent across welcome / lookup / future flows. Pass the data
 * URL from `magicLinkQrDataUrl` and a short caption.
 *
 * Returns "" if dataUrl is null so callers can blindly inject —
 * empty string + no QR = email still works via the link button.
 */
export function qrEmailBlock(
  dataUrl: string | null,
  caption = "Or scan from another device to sign in there",
): string {
  if (!dataUrl) return "";
  return `
    <div style="margin: 24px 0; padding: 16px; background: #fdfaf3; border: 1px solid #e5dcc7; border-radius: 12px; text-align: center;">
      <p style="margin: 0 0 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #7d6e5a; font-weight: bold;">
        Sign in on a different device
      </p>
      <img
        src="${dataUrl}"
        alt="QR code — scan to sign in"
        width="200"
        height="200"
        style="display: inline-block; max-width: 200px; height: auto; border-radius: 8px;"
      />
      <p style="margin: 12px 0 0; font-size: 12px; color: #555; line-height: 1.4;">
        ${caption}
      </p>
    </div>
  `;
}
