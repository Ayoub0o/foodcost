import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type {
  AuthorFrontmatter,
  BlogFrontmatter,
  ContentLocale,
  GuideFrontmatter,
  HelpFrontmatter,
  LoadedDoc,
} from "./types";

let cachedRoot: string | null = null;
const fileCache = new Map<string, { mtimeMs: number; doc: LoadedDoc<unknown> }>();
const listCache = new Map<string, { mtimeMs: number; files: string[] }>();

/** Repo-root `content/` (works from apps/web and monorepo root). */
export function contentRoot(): string {
  if (cachedRoot) return cachedRoot;
  const candidates = [
    path.resolve(process.cwd(), "content"),
    path.resolve(process.cwd(), "../../content"),
    path.resolve(process.cwd(), "../content"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      cachedRoot = c;
      return c;
    }
  }
  cachedRoot = path.resolve(process.cwd(), "../../content");
  return cachedRoot;
}

function listMdx(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const mtimeMs = fs.statSync(dir).mtimeMs;
  const hit = listCache.get(dir);
  if (hit && hit.mtimeMs === mtimeMs) return hit.files;
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => path.join(dir, f));
  listCache.set(dir, { mtimeMs, files });
  return files;
}

function loadFile<T>(filePath: string): LoadedDoc<T> {
  const mtimeMs = fs.statSync(filePath).mtimeMs;
  const hit = fileCache.get(filePath);
  if (hit && hit.mtimeMs === mtimeMs) {
    return hit.doc as LoadedDoc<T>;
  }
  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);
  const doc: LoadedDoc<T> = {
    frontmatter: data as T,
    body: content.trim(),
    filePath,
  };
  fileCache.set(filePath, { mtimeMs, doc: doc as LoadedDoc<unknown> });
  return doc;
}

export function loadBlogPosts(locale?: ContentLocale): LoadedDoc<BlogFrontmatter>[] {
  const locales = locale ? [locale] : (["en", "fr"] as ContentLocale[]);
  const docs: LoadedDoc<BlogFrontmatter>[] = [];
  for (const loc of locales) {
    for (const file of listMdx(path.join(contentRoot(), "blog", loc))) {
      const doc = loadFile<BlogFrontmatter>(file);
      if (doc.frontmatter.draft) continue;
      docs.push(doc);
    }
  }
  return docs.sort(
    (a, b) =>
      new Date(b.frontmatter.publishedAt).getTime() -
      new Date(a.frontmatter.publishedAt).getTime(),
  );
}

export function loadBlogPost(
  locale: ContentLocale,
  slug: string,
): LoadedDoc<BlogFrontmatter> | null {
  const file = path.join(contentRoot(), "blog", locale, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const doc = loadFile<BlogFrontmatter>(file);
  if (doc.frontmatter.draft) return null;
  return doc;
}

export function loadHelpArticles(locale?: ContentLocale): LoadedDoc<HelpFrontmatter>[] {
  const locales = locale ? [locale] : (["en", "fr"] as ContentLocale[]);
  const docs: LoadedDoc<HelpFrontmatter>[] = [];
  for (const loc of locales) {
    for (const file of listMdx(path.join(contentRoot(), "help", loc))) {
      const doc = loadFile<HelpFrontmatter>(file);
      if (doc.frontmatter.draft) continue;
      docs.push(doc);
    }
  }
  return docs.sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}

export function loadHelpArticle(
  locale: ContentLocale,
  slug: string,
): LoadedDoc<HelpFrontmatter> | null {
  const file = path.join(contentRoot(), "help", locale, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const doc = loadFile<HelpFrontmatter>(file);
  if (doc.frontmatter.draft) return null;
  return doc;
}

export function loadGuides(
  locale?: ContentLocale,
  opts?: { includeDrafts?: boolean },
): LoadedDoc<GuideFrontmatter>[] {
  const locales = locale ? [locale] : (["en", "fr"] as ContentLocale[]);
  const docs: LoadedDoc<GuideFrontmatter>[] = [];
  for (const loc of locales) {
    for (const file of listMdx(path.join(contentRoot(), "guides", loc))) {
      const doc = loadFile<GuideFrontmatter>(file);
      if (doc.frontmatter.draft && !opts?.includeDrafts) continue;
      docs.push(doc);
    }
  }
  return docs;
}

export function loadGuide(
  locale: ContentLocale,
  slug: string,
  opts?: { includeDrafts?: boolean },
): LoadedDoc<GuideFrontmatter> | null {
  const file = path.join(contentRoot(), "guides", locale, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const doc = loadFile<GuideFrontmatter>(file);
  if (doc.frontmatter.draft && !opts?.includeDrafts) return null;
  return doc;
}

export function loadAuthors(): LoadedDoc<AuthorFrontmatter>[] {
  return listMdx(path.join(contentRoot(), "authors")).map((f) => loadFile<AuthorFrontmatter>(f));
}

export function loadAuthor(slug: string): LoadedDoc<AuthorFrontmatter> | null {
  const file = path.join(contentRoot(), "authors", `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  return loadFile<AuthorFrontmatter>(file);
}

export function wordCount(body: string): number {
  return body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .split(/\s+/)
    .filter(Boolean).length;
}

export function extractMarkdownLinks(body: string): { text: string; href: string }[] {
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  const out: { text: string; href: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(body))) {
    out.push({ text: m[1]!, href: m[2]! });
  }
  return out;
}
