import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Port A Local",
  description:
    "Privacy policy for The Port A Local — how we collect, use, and protect your information.",
};

const sections = [
  {
    title: "Who We Are",
    content: [
      "The Port A Local (theportalocal.com) is operated by Palm Family Ventures LLC. When we say \"we,\" \"us,\" or \"our\" in this policy, we mean Palm Family Ventures LLC.",
    ],
  },
  {
    title: "What We Collect",
    content: [
      "When you submit a maintenance request, rental booking, or service inquiry through our site, we may collect:",
    ],
    list: [
      "Your name",
      "Phone number",
      "Email address",
      "Property or mailing address",
      "Details about your service request",
    ],
    afterList:
      "We only collect information you provide directly through our forms. We do not collect data passively or build profiles about you.",
  },
  {
    title: "How We Use Your Information",
    content: [
      "We use the information you provide to:",
    ],
    list: [
      "Process and fulfill your service requests",
      "Send you SMS and email confirmations about your request",
      "Dispatch vendors and coordinate services on your behalf",
      "Communicate with you about your booking or inquiry",
    ],
    afterList: "That's it. We don't use your data for advertising, profiling, or anything unrelated to the service you requested.",
  },
  {
    title: "SMS Messaging",
    content: [
      "When you provide your phone number and opt in, we may send you text messages related to your service request, booking confirmation, or status updates.",
    ],
    list: [
      "Message frequency varies based on your service requests",
      "Message and data rates may apply",
      "Text STOP to any message to opt out of SMS communications",
      "Text HELP to any message for support information",
      "Carriers are not liable for delayed or undelivered messages",
    ],
    afterList:
      "Opting out of SMS will not affect your ability to use our services. We will never send marketing or promotional texts.",
  },
  {
    title: "Third-Party Services",
    content: [
      "We use a small number of trusted third-party services to operate the site:",
    ],
    list: [
      "Stripe — processes payments securely. We never see or store your full card number.",
      "Twilio — delivers SMS messages for booking confirmations and service updates.",
      "Resend — sends transactional emails on our behalf.",
    ],
    afterList:
      "These services only receive the minimum information needed to perform their function. Each has its own privacy policy governing how they handle data.",
  },
  {
    title: "We Do Not Sell Your Data",
    content: [
      "We do not sell, rent, trade, or share your personal information with third parties for marketing purposes. Period.",
    ],
  },
  {
    title: "Cookies & Local Storage",
    content: [
      "We do not use tracking cookies, analytics cookies, or advertising pixels.",
      "The only browser storage we use is localStorage for the Trip Planner feature, which saves your bookmarked places and activities locally on your device. This data never leaves your browser.",
    ],
  },
  {
    title: "Data Retention",
    content: [
      "We keep your information only as long as needed to fulfill your service request and any related follow-up. Once a request is completed and there is no ongoing service relationship, we do not retain your data indefinitely.",
    ],
  },
  {
    title: "Your Rights",
    content: [
      "You can request to see, update, or delete any personal information we have about you at any time. Just email us and we will take care of it promptly.",
    ],
  },
  {
    title: "Changes to This Policy",
    content: [
      "If we update this policy, we will post the revised version here with a new \"Last updated\" date. We won't make major changes without making it clear.",
    ],
  },
  {
    title: "Contact Us",
    content: [
      "If you have any questions about this privacy policy or how we handle your data, reach out:",
    ],
    contact: true,
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-16 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-sand-50 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg sm:text-xl text-navy-200 font-light max-w-2xl mx-auto">
            How we collect, use, and protect your information. The short version: we only use it to help you, and we never sell it.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
          <p className="text-sm text-navy-400 font-medium">
            Last updated: April 13, 2026
          </p>

          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="font-display text-2xl font-bold text-navy-900 mb-4">
                {section.title}
              </h2>

              <div className="bg-white rounded-2xl border border-sand-200 p-6 sm:p-8">
                {section.content.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-sm text-navy-600 leading-relaxed font-light mb-3 last:mb-0"
                  >
                    {paragraph}
                  </p>
                ))}

                {section.list && (
                  <ul className="space-y-2 mt-3">
                    {section.list.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-coral-400 mt-0.5 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        <span className="text-sm text-navy-600 leading-relaxed font-light">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.afterList && (
                  <p className="text-sm text-navy-600 leading-relaxed font-light mt-4">
                    {section.afterList}
                  </p>
                )}

                {section.contact && (
                  <div className="mt-2">
                    <a
                      href="mailto:hello@theportalocal.com"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-coral-500 hover:text-coral-600 transition-colors"
                    >
                      hello@theportalocal.com
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
