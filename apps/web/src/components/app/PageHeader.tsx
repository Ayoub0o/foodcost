export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border-mute pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-heading">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-text">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
