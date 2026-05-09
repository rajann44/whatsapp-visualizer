import { AppHeader } from "@/components/app-header";
import { SiteFooter } from "@/components/site-footer";
import { UploadScreen } from "@/components/whatsapp/upload-screen";

export default function HomePage() {
  return (
    <main>
      <AppHeader />

      <div className="container workspace-enter py-6 md:py-10">
        <UploadScreen />
      </div>
      <SiteFooter />
    </main>
  );
}
