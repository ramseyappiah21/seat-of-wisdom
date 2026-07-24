import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-mist">
      <div className="print:hidden">
        <SiteHeader />
      </div>
      <main className="flex-1 bg-mist">{children}</main>
      <div className="print:hidden">
        <SiteFooter />
      </div>
    </div>
  );
}
