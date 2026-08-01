import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { requirePlatformAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const admin = await requirePlatformAdmin();
  if (!admin) redirect(`/${locale}/login`);

  return (
    <AdminShell locale={locale} email={admin.email}>
      {children}
    </AdminShell>
  );
}
