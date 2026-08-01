/**
 * Transactional email (Resend). When RESEND_API_KEY is unset, messages are
 * logged + stored in-memory for E2E assertions.
 */

export type TrialEmailKind = "d0_welcome" | "d10_reminder" | "d13_final" | "d14_lock";

export type SupportEmailKind = "support_ticket_created" | "support_admin_reply" | "support_admin_notify";

export type EmailKind = TrialEmailKind | SupportEmailKind | "generic";

export interface StubEmail {
  to: string;
  subject: string;
  text: string;
  kind: EmailKind;
  at: string;
}

declare global {
  var __foodcostEmailStubs: StubEmail[] | undefined;
}

function stubStore(): StubEmail[] {
  if (!globalThis.__foodcostEmailStubs) globalThis.__foodcostEmailStubs = [];
  return globalThis.__foodcostEmailStubs;
}

export function getStubEmails(limit = 20): StubEmail[] {
  return stubStore().slice(-limit).reverse();
}

export function clearStubEmails() {
  globalThis.__foodcostEmailStubs = [];
}

async function deliver(opts: {
  to: string;
  subject: string;
  text: string;
  kind: EmailKind;
}): Promise<{ ok: boolean; id?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "FoodCost <noreply@pixplat.com>";

  stubStore().push({
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    kind: opts.kind,
    at: new Date().toISOString(),
  });
  if (stubStore().length > 100) stubStore().splice(0, stubStore().length - 100);

  if (!apiKey) {
    console.info("[email:stub]", { to: opts.to, kind: opts.kind, subject: opts.subject });
    return { ok: true, id: `stub_${opts.kind}` };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [opts.to], subject: opts.subject, text: opts.text }),
  });

  if (!res.ok) {
    console.error("[email:error]", await res.text());
    return { ok: false };
  }
  const data = (await res.json()) as { id?: string };
  return { ok: true, id: data.id };
}

export interface SendEmailInput {
  to: string;
  locale: "en" | "fr";
  kind: TrialEmailKind;
  workspaceName: string;
  exportUrl?: string;
  daysLeft?: number;
}

const SUBJECTS: Record<TrialEmailKind, { en: string; fr: string }> = {
  d0_welcome: {
    en: "Welcome to FoodCost — your 14-day trial starts now",
    fr: "Bienvenue sur FoodCost — votre essai de 14 jours commence",
  },
  d10_reminder: {
    en: "4 days left in your FoodCost trial",
    fr: "Il vous reste 4 jours d'essai FoodCost",
  },
  d13_final: {
    en: "Tomorrow your FoodCost trial ends",
    fr: "Votre essai FoodCost se termine demain",
  },
  d14_lock: {
    en: "Your FoodCost workspace is now read-only",
    fr: "Votre espace FoodCost est maintenant en lecture seule",
  },
};

function bodyFor(input: SendEmailInput): string {
  const { kind, locale, workspaceName, exportUrl, daysLeft } = input;
  if (locale === "fr") {
    switch (kind) {
      case "d0_welcome":
        return `Bonjour,\n\nVotre espace « ${workspaceName} » est prêt. Ajoutez 5 ingrédients et 3 recettes pour activer le costing.\n\n— FoodCost by PixPlat`;
      case "d10_reminder":
        return `Bonjour,\n\nIl reste ${daysLeft ?? 4} jours d'essai sur « ${workspaceName} ». Passez en Pro pour garder la propagation et les alertes.\n\n— FoodCost by PixPlat`;
      case "d13_final":
        return `Bonjour,\n\nDernier rappel : l'essai de « ${workspaceName} » se termine demain. Abonnez-vous pour éviter le mode lecture seule.\n\n— FoodCost by PixPlat`;
      case "d14_lock":
        return `Bonjour,\n\n« ${workspaceName} » est maintenant en lecture seule. Exportez vos données : ${exportUrl ?? ""}\n\n— FoodCost by PixPlat`;
    }
  }
  switch (kind) {
    case "d0_welcome":
      return `Hi,\n\nYour workspace “${workspaceName}” is ready. Add 5 ingredients and 3 recipes to activate costing.\n\n— FoodCost by PixPlat`;
    case "d10_reminder":
      return `Hi,\n\n${daysLeft ?? 4} days left on “${workspaceName}”. Upgrade to Pro to keep propagation and alerts.\n\n— FoodCost by PixPlat`;
    case "d13_final":
      return `Hi,\n\nFinal reminder: the trial for “${workspaceName}” ends tomorrow. Subscribe to avoid read-only mode.\n\n— FoodCost by PixPlat`;
    case "d14_lock":
      return `Hi,\n\n“${workspaceName}” is now read-only. Export your data: ${exportUrl ?? ""}\n\n— FoodCost by PixPlat`;
  }
}

export async function sendTransactionalEmail(input: SendEmailInput): Promise<{ ok: boolean; id?: string }> {
  return deliver({
    to: input.to,
    subject: SUBJECTS[input.kind][input.locale],
    text: bodyFor(input),
    kind: input.kind,
  });
}

export async function sendSupportEmail(input: {
  to: string;
  locale: "en" | "fr";
  kind: SupportEmailKind;
  subject: string;
  body: string;
  ticketRef: string;
  ticketUrl?: string;
}): Promise<{ ok: boolean; id?: string }> {
  const tag = `[FC-${input.ticketRef.slice(0, 8)}]`;
  const subject =
    input.kind === "support_admin_reply"
      ? `${tag} ${input.locale === "fr" ? "Réponse à votre demande" : "Reply to your request"}: ${input.subject}`
      : input.kind === "support_admin_notify"
        ? `${tag} New support ticket: ${input.subject}`
        : `${tag} ${input.locale === "fr" ? "Nous avons reçu votre demande" : "We received your request"}: ${input.subject}`;

  const text =
    input.locale === "fr"
      ? `${input.body}\n\n${input.ticketUrl ? `Voir le ticket : ${input.ticketUrl}\n` : ""}— FoodCost Support`
      : `${input.body}\n\n${input.ticketUrl ? `View ticket: ${input.ticketUrl}\n` : ""}— FoodCost Support`;

  return deliver({ to: input.to, subject, text, kind: input.kind });
}
