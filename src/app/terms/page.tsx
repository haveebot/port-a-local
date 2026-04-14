import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Port A Local",
  description:
    "Terms and conditions for using theportalocal.com, operated by Palm Family Ventures LLC.",
};

const sections = [
  {
    title: "Acceptance of Terms",
    content:
      "By accessing or using theportalocal.com (the \"Site\"), you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the Site. Your continued use of the Site following any changes to these terms constitutes acceptance of those changes.",
  },
  {
    title: "About Port A Local",
    content:
      "Port A Local is a local business directory and services platform for Port Aransas, TX. The Site is operated by Palm Family Ventures LLC. We help visitors and locals find businesses, services, and things to do on the island.",
  },
  {
    title: "Portal Services",
    content:
      "Port A Local offers portal services including maintenance dispatch, beach rentals, and golf cart rentals. All portal services are subject to availability and may vary by season. We act as a platform connecting you with local service providers and cannot guarantee availability, pricing, or outcomes for any specific service request.",
  },
  {
    title: "SMS Program",
    content:
      "By providing your phone number through the Site, you consent to receive transactional SMS messages from Port A Local. Our SMS program includes service confirmations and dispatch notifications. Message frequency varies based on your use of our services. Message and data rates may apply. Text STOP to any message to cancel. Text HELP for assistance. Carriers are not liable for delayed or undelivered messages. You may opt out at any time.",
  },
  {
    title: "Payments",
    content:
      "Payments on the Site are processed securely through Stripe. By making a payment, you agree to Stripe's terms of service in addition to these terms. All fees are non-refundable unless otherwise stated at the time of purchase or required by applicable law.",
  },
  {
    title: "User-Submitted Content",
    content:
      "When you submit content to the Site — including tag suggestions, photos, reviews, or other materials — you grant Port A Local a non-exclusive, royalty-free, perpetual license to use, display, modify, and distribute that content in connection with the Site and our services. You represent that you have the right to submit any content you provide.",
  },
  {
    title: "Accuracy of Information",
    content:
      "Business listings, hours, availability, and other information on the Site are provided \"as-is\" and may not always be current or accurate. We make reasonable efforts to keep information up to date, but we do not guarantee the accuracy, completeness, or reliability of any listing or content on the Site. Always confirm details directly with the business before visiting.",
  },
  {
    title: "Limitation of Liability",
    content:
      "Port A Local and Palm Family Ventures LLC are not liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of the Site or any services arranged through it. This includes, but is not limited to, damages resulting from inaccurate listings, service disruptions, third-party service provider actions, or inability to access the Site. Your use of the Site and any services is at your own risk.",
  },
  {
    title: "Third-Party Links & Services",
    content:
      "The Site may contain links to third-party websites or services. We are not responsible for the content, accuracy, or practices of any third-party sites. Accessing third-party links is at your own risk.",
  },
  {
    title: "Governing Law",
    content:
      "These Terms & Conditions are governed by and construed in accordance with the laws of the State of Texas, without regard to its conflict of law provisions. Any disputes arising under these terms shall be resolved in the courts of the State of Texas.",
  },
  {
    title: "Changes to These Terms",
    content:
      "We may update these Terms & Conditions from time to time. When we do, we will revise the \"Last Updated\" date at the top of this page. Your continued use of the Site after any changes constitutes your acceptance of the updated terms.",
  },
  {
    title: "Contact",
    content:
      "If you have questions about these Terms & Conditions, contact us at hello@theportalocal.com.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      <Navigation />

      {/* Hero */}
      <section className="pt-28 pb-16 hero-gradient relative">
        <div className="absolute bottom-0 left-0 right-0 coral-line" />
        <div className="absolute inset-0 palm-pattern opacity-15" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-sand-50 mb-4">
            Terms &amp; Conditions
          </h1>
          <p className="text-lg text-navy-200 font-light max-w-2xl mx-auto">
            Last updated: April 13, 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
          {sections.map((section, index) => (
            <div
              key={section.title}
              className="bg-white rounded-2xl border border-sand-200 p-6 sm:p-8"
            >
              <h2 className="font-display text-xl font-bold text-navy-900 mb-3">
                {index + 1}. {section.title}
              </h2>
              <p className="text-sm text-navy-600 leading-relaxed font-light">
                {section.content}
              </p>
            </div>
          ))}

          <div className="text-center pt-4">
            <p className="text-xs text-navy-400 font-light">
              Port A Local is operated by Palm Family Ventures LLC.
              <br />
              Questions? Reach us at{" "}
              <a
                href="mailto:hello@theportalocal.com"
                className="text-coral-500 hover:text-coral-600 transition-colors"
              >
                hello@theportalocal.com
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
