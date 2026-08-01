import { Link } from "@/i18n/navigation";

export function AuthorBlock({
  name,
  role,
  slug,
  updatedAt,
  locale,
}: {
  name: string;
  role?: string;
  slug: string;
  updatedAt: string;
  locale: string;
}) {
  return (
    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-sm">
      <div>
        <p className="text-heading">
          <Link href={{ pathname: "/authors/[slug]", params: { slug } }} className="font-semibold text-accent-text hover:underline">
            {name}
          </Link>
          {role ? <span className="text-text"> · {role}</span> : null}
        </p>
        <p className="mt-1 text-xs text-text">
          Last updated{" "}
          {new Date(updatedAt).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
