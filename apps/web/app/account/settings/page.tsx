import { Container } from "@tasheen/ui";
import { buildMetadata } from "@/lib/seo";
import { AccountSidebar } from "@/features/user-management/components/AccountSidebar";
import { EditProfileForm } from "@/features/user-management/components/EditProfileForm";

export const metadata = buildMetadata({
  title: "Account Settings",
  description: "Update your personal details and artisanal preferences.",
  path: "/account/settings",
});

export default function SettingsPage() {
  return (
    <Container size="full" className="flex-1 p-0">
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-10rem)] bg-white">
        <AccountSidebar />
        <main className="flex-1 p-8 lg:p-16">
          <EditProfileForm />
        </main>
      </div>
    </Container>
  );
}
