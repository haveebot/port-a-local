import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maintenance Services in Port Aransas, TX — Port A Local",
  description:
    "Submit a maintenance request in Port Aransas, Texas. Handyman, plumbing, electrical, HVAC, landscaping and more — connected to Port A's most trusted local crew.",
};

export default function MaintenanceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
