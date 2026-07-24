import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteHeader } from "@/components/marketing/SiteHeader";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-mist">
      <SiteHeader />
      <main className="flex-1 bg-mist">{children}</main>
      <SiteFooter />
    </div>
  );
}
