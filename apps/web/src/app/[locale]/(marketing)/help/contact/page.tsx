import { setRequestLocale } from "next-intl/server";
import { SupportForm } from "@/components/app/SupportForm";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HelpContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  return (
    <main className="container-bringer py-16">
      <h1 className="text-3xl font-semibold text-heading">
        {locale === "fr" ? "Contacter le support" : "Contact support"}
      </h1>
      <SupportForm locale={locale} page="help-contact" />
    </main>
  );
}
