import type { Metadata } from "next";
import LookupForm from "./LookupForm";
import InstallAsAppBanner from "@/components/deliver/InstallAsAppBanner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in — PAL Delivery Runner",
  robots: { index: false, follow: false },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const sp = await searchParams;
  const message =
    sp.from === "expired"
      ? "Your link expired. Enter your phone — we'll email you a fresh sign-in link."
      : sp.from === "no-session"
        ? "Sign in to your runner home. Enter the phone you signed up with — we'll email you a one-tap sign-in link."
        : "Enter the phone you signed up with. We'll email you a one-tap sign-in link.";

  return (
    <main className="min-h-screen bg-navy-900 text-sand-50 flex flex-col">
      <header className="px-4 sm:px-6 py-5 border-b border-coral-500/30">
        <p className="text-[10px] tracking-widest uppercase text-coral-300">
          PAL Delivery · Runner
        </p>
        <p className="font-display text-lg font-bold mt-1">Sign in</p>
      </header>

      <div className="flex-1 flex items-start justify-center px-4 sm:px-6 py-8">
        <div className="max-w-md w-full">
          <InstallAsAppBanner context="sign-in" />
          <p className="text-sm text-sand-300 font-light mb-6">{message}</p>
          <LookupForm />
        </div>
      </div>
    </main>
  );
}
