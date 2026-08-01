import ReactMarkdown from "react-markdown";

/** Renders MDX/Markdown body for blog, help, and guides. */
export function MarkdownBody({ source }: { source: string }) {
  return (
    <div className="prose-foodcost space-y-4 text-base leading-relaxed text-text">
      <ReactMarkdown
        components={{
          h2: ({ children }) => (
            <h2 className="mt-10 text-2xl font-semibold tracking-[-0.03em] text-heading">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 text-xl font-semibold text-heading">{children}</h3>
          ),
          p: ({ children }) => <p className="text-text">{children}</p>,
          ul: ({ children }) => <ul className="list-disc space-y-2 pl-5 text-text">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-2 pl-5 text-text">{children}</ol>,
          a: ({ href, children }) => (
            <a href={href} className="text-accent-text underline underline-offset-2 hover:text-heading">
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border bg-container px-3 py-2 text-left text-heading">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-3 py-2 text-text">{children}</td>
          ),
          strong: ({ children }) => <strong className="font-semibold text-heading">{children}</strong>,
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
