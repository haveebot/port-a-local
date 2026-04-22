/**
 * Shared branded email layout.
 *
 * Every transactional email goes through this — booking confirmations,
 * maintenance alerts, tip suggestions, internal notifications. Consistent
 * PAL identity on every piece of mail we send.
 *
 * Uses inline styles because email clients are hostile to stylesheets and
 * modern CSS. Keep it boring and robust.
 */

export interface EmailLayoutProps {
  /** Short preheader shown in most inbox previews before the email is opened. */
  preheader?: string;
  /** The email body content (already rendered as HTML). */
  bodyHtml: string;
  /** Optional CTA at the bottom of the body — rendered as a button. */
  cta?: { label: string; href: string };
  /** Tone of the email header: "default" (coral accent) or "alert" (darker). */
  tone?: "default" | "alert";
}

const SITE_URL = "https://theportalocal.com";
const LOGO_URL = `${SITE_URL}/logos/lighthouse-standard.svg`;

export function emailLayout({
  preheader,
  bodyHtml,
  cta,
  tone = "default",
}: EmailLayoutProps): string {
  const accentBar =
    tone === "alert"
      ? "background: linear-gradient(90deg, #e8656f 0%, #c74b54 100%);"
      : "background: linear-gradient(90deg, #e8656f 0%, #f0a0a6 50%, #fbd38d 100%);";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Port A Local</title>
</head>
<body style="margin:0; padding:0; background-color:#f5f0e8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif; color:#0b1120;">
  ${preheader ? `<div style="display:none; font-size:1px; color:#f5f0e8; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">${preheader}</div>` : ""}

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f5f0e8;">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width:560px; width:100%; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow: 0 1px 3px rgba(11,17,32,0.06); border:1px solid #e4dccc;">

          <!-- Accent bar -->
          <tr>
            <td style="height: 3px; ${accentBar}"></td>
          </tr>

          <!-- Header lockup -->
          <tr>
            <td style="padding: 28px 32px 8px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-right: 14px; vertical-align: middle;">
                    <img src="${LOGO_URL}" width="44" height="44" alt="Port A Local" style="display:block; border:0;" />
                  </td>
                  <td style="vertical-align: middle;">
                    <div style="font-family: Georgia, serif; font-size: 20px; font-weight: 700; color: #e8656f; letter-spacing: 0.04em; line-height: 1;">PORT A LOCAL</div>
                    <div style="font-size: 9px; color: #8896ab; letter-spacing: 0.3em; text-transform: uppercase; margin-top: 6px;">Port Aransas, TX</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 16px 32px 0 32px;">
              <div style="height:1px; background-color:#e4dccc;"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 24px 32px 32px 32px; font-size: 15px; line-height: 1.6; color: #1e3a5f;">
              ${bodyHtml}
              ${
                cta
                  ? `
              <div style="margin-top: 28px; text-align: left;">
                <a href="${cta.href}" style="display:inline-block; padding: 12px 22px; border-radius: 10px; background-color: #e8656f; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; letter-spacing: 0.02em;">${cta.label}</a>
              </div>
              `
                  : ""
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <div style="height:1px; background-color:#e4dccc; margin-bottom: 20px;"></div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="font-size: 12px; color: #8896ab; line-height: 1.6;">
                    <div><a href="${SITE_URL}" style="color:#e8656f; text-decoration:none; font-weight:600;">theportalocal.com</a></div>
                    <div style="font-family: monospace; margin-top: 4px;">27°50′N · 97°03′W</div>
                    <div style="margin-top: 8px;">Features, analysis and the island as it is.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <!-- Outside disclaimer -->
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width:560px; width:100%;">
          <tr>
            <td style="padding: 16px 16px 0 16px; font-size: 11px; color: #8896ab; text-align: center; line-height: 1.5;">
              This message was sent by Port A Local · Palm Family Ventures, LLC · Port Aransas, TX
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}
