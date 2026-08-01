export type ContentLocale = "en" | "fr";

export interface BlogFrontmatter {
  title: string;
  description: string;
  slug: string;
  locale: ContentLocale;
  translationOf: string;
  category: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  author: string;
  coverImage?: string;
  draft?: boolean;
}

export interface HelpFrontmatter {
  title: string;
  description: string;
  slug: string;
  locale: ContentLocale;
  translationOf: string;
  order: number;
  updatedAt: string;
  draft?: boolean;
}

export interface GuideFrontmatter {
  title: string;
  description: string;
  slug: string;
  locale: ContentLocale;
  translationOf: string;
  definition: string;
  author: string;
  updatedAt: string;
  publishedAt: string;
  draft?: boolean;
  /** Programmatic dish/cuisine guides */
  programmatic?: boolean;
  /** Costed example table present (gate) */
  hasCostedExample?: boolean;
  /** Pre-filled calculator deep link */
  calculatorHref?: string;
}

export interface AuthorFrontmatter {
  name: string;
  slug: string;
  role: string;
  bio: string;
  locale: ContentLocale;
}

export interface LoadedDoc<T> {
  frontmatter: T;
  body: string;
  filePath: string;
}
