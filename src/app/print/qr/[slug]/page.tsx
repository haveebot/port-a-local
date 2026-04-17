import QRCode from "qrcode";
import { notFound } from "next/navigation";

/**
 * Printable QR code posters — 8.5x11, for physical display.
 * Open /print/qr/[slug] in browser, File > Print (or Save as PDF).
 * Error correction level H allows a lighthouse overlay in the center.
 */

interface QRTarget {
  url: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  detail?: string;
  footerPath: string;
}

const targets: Record<string, QRTarget> = {
  home: {
    url: "https://theportalocal.com",
    eyebrow: "Your Guide to Port Aransas",
    title: "Port A Local",
    subtitle: "Locally vetted. Always independent.",
    cta: "Scan to explore the island",
    detail:
      "140+ vetted businesses · Heritage stories · Live conditions · Golf cart, beach, and maintenance rentals — all in one place.",
    footerPath: "theportalocal.com",
  },
  sandfest: {
    url: "https://theportalocal.com/history/texas-sandfest",
    eyebrow: "Port A Heritage",
    title: "The Card Table That Built Texas Sandfest",
    subtitle: "Two Port Aransas moms. A folding card table. 29 years.",
    cta: "Scan to read the full story",
    detail:
      "How Sandfest started, why the sand here stacks better than anywhere else, and how $1.5 million in grants have gone back to the island since 2012.",
    footerPath: "theportalocal.com/history/texas-sandfest",
  },
};

export async function generateStaticParams() {
  return Object.keys(targets).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const target = targets[slug];
  return {
    title: target ? `${target.title} — QR Print Sheet | Port A Local` : "QR Print Sheet",
    robots: { index: false, follow: false },
  };
}

export default async function QRPrintPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const target = targets[slug];
  if (!target) notFound();

  // Generate QR code as SVG with high error correction (H = 30% recovery)
  // Allows a lighthouse overlay in the center without breaking scannability.
  const qrSvg = await QRCode.toString(target.url, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 1,
    width: 600,
    color: {
      dark: "#0b1120", // navy-950
      light: "#ffffff",
    },
  });

  return (
    <>
      {/* Print-specific CSS */}
      <style>{`
        @page {
          size: letter;
          margin: 0;
        }
        html, body {
          margin: 0;
          padding: 0;
          background: #f5f0e8;
        }
        .print-page {
          width: 8.5in;
          height: 11in;
          margin: 0 auto;
          background: #fdfbf7;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .coral-bar {
          height: 0.08in;
          background: linear-gradient(90deg, #e8656f 0%, #f2a1a8 50%, #e8656f 100%);
          flex-shrink: 0;
        }
        .navy-bar {
          height: 0.05in;
          background: #0b1120;
          flex-shrink: 0;
        }
        .header {
          padding: 0.6in 0.8in 0.3in 0.8in;
          display: flex;
          align-items: center;
          gap: 0.25in;
          flex-shrink: 0;
        }
        .header-mark {
          width: 0.9in;
          height: 0.9in;
          flex-shrink: 0;
        }
        .header-text { display: flex; flex-direction: column; }
        .brand-name {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          font-size: 0.42in;
          color: #e8656f;
          letter-spacing: 0.02em;
          line-height: 1;
        }
        .brand-location {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.09in;
          letter-spacing: 0.28em;
          color: #5b6980;
          text-transform: uppercase;
          margin-top: 0.05in;
        }
        .content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0.2in 0.8in;
          text-align: center;
        }
        .eyebrow {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.13in;
          letter-spacing: 0.28em;
          color: #e8656f;
          text-transform: uppercase;
          font-weight: 500;
          margin-bottom: 0.2in;
        }
        .title {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          font-size: 0.42in;
          color: #0b1120;
          line-height: 1.15;
          margin: 0 0 0.12in 0;
          max-width: 6in;
        }
        .subtitle {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-weight: 400;
          font-size: 0.2in;
          color: #4a5568;
          line-height: 1.3;
          margin: 0 0 0.5in 0;
          max-width: 6in;
        }
        .qr-wrap {
          position: relative;
          width: 4.8in;
          height: 4.8in;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.35in;
        }
        .qr-wrap svg {
          width: 100%;
          height: 100%;
          display: block;
        }
        .qr-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 0.9in;
          height: 0.9in;
          background: #fdfbf7;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 0 0.04in #fdfbf7;
        }
        .qr-overlay img { width: 0.7in; height: 0.7in; display: block; }
        .cta {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.2in;
          font-weight: 600;
          color: #0b1120;
          margin: 0 0 0.15in 0;
          letter-spacing: 0.01em;
        }
        .detail {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.14in;
          color: #4a5568;
          line-height: 1.5;
          font-weight: 300;
          max-width: 5.5in;
          margin: 0;
        }
        .footer {
          padding: 0.3in 0.8in 0.55in 0.8in;
          border-top: 1px solid #e4dccc;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
        }
        .footer-url {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.14in;
          color: #0b1120;
          font-weight: 600;
          letter-spacing: 0.01em;
        }
        .footer-coords {
          font-family: 'Courier New', monospace;
          font-size: 0.1in;
          letter-spacing: 0.15em;
          color: #8896ab;
          text-transform: uppercase;
        }
        .footer-coords span { margin: 0 0.1in; color: #e8656f; }
        .preview-bar {
          position: sticky;
          top: 0;
          background: #0b1120;
          color: #f5f0e8;
          padding: 0.1in 0.2in;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 11px;
          text-align: center;
          z-index: 10;
        }
        .preview-bar a { color: #f2a1a8; text-decoration: underline; }
        @media print {
          .preview-bar { display: none !important; }
          html, body { background: white; }
        }
      `}</style>

      {/* On-screen preview helper — hidden when printing */}
      <div className="preview-bar">
        Preview — Press <strong>Cmd/Ctrl + P</strong> to print or save as PDF. Letter size, 8.5×11.
      </div>

      <div className="print-page">
        <div className="coral-bar" />
        <div className="navy-bar" />

        {/* Header */}
        <div className="header">
          {/* Lighthouse mark — standard detail, dark variant for print */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="header-mark" src="/logos/lighthouse-standard.svg" alt="Port A Local" />
          <div className="header-text">
            <div className="brand-name">PORT A LOCAL</div>
            <div className="brand-location">Port Aransas, TX</div>
          </div>
        </div>

        {/* Main content */}
        <div className="content">
          <div className="eyebrow">{target.eyebrow}</div>
          <h1 className="title">{target.title}</h1>
          <p className="subtitle">{target.subtitle}</p>

          <div className="qr-wrap">
            <div dangerouslySetInnerHTML={{ __html: qrSvg }} />
            <div className="qr-overlay">
              {/* Lighthouse icon — matches site brand, icon variant for small sizes */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/lighthouse-icon.svg" alt="" />
            </div>
          </div>

          <p className="cta">{target.cta}</p>
          {target.detail && <p className="detail">{target.detail}</p>}
        </div>

        <div className="footer">
          <div className="footer-url">{target.footerPath}</div>
          <div className="footer-coords">
            27°50′N<span>·</span>97°03′W<span>·</span>Mustang Island
          </div>
        </div>

        <div className="navy-bar" />
        <div className="coral-bar" />
      </div>
    </>
  );
}
