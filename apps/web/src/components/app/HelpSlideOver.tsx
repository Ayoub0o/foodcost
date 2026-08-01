"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SupportForm } from "@/components/app/SupportForm";

interface Article {
  title: string;
  body: string;
}

type PageKey = "overview" | "ingredients" | "recipes" | "profitability" | "reports" | "settings";

const ARTICLES: Record<"en" | "fr", Record<PageKey, Article[]>> = {
  en: {
    overview: [
      { title: "Reading your KPIs", body: "Average food cost % is the mean across every priced dish. Aim below your target; dishes over the threshold are counted separately so you know what to fix first." },
      { title: "The setup checklist", body: "Add ingredients, build a few recipes and set menu prices. Once every dish has a price, your food cost % becomes meaningful." },
    ],
    ingredients: [
      { title: "Yield % and trim loss", body: "Yield is the usable portion after trimming and waste. A lettuce at 80% yield costs 25% more per usable gram than its purchase price suggests." },
      { title: "Density & unit weight", body: "Fill this only when you buy in one dimension and use in another — e.g. buy oil by the litre but measure in grams (density), or buy eggs by the piece but use grams (unit weight)." },
      { title: "Changing a price", body: "Editing a purchase price instantly recomputes every recipe that uses the ingredient, directly or through a sub-recipe." },
    ],
    recipes: [
      { title: "Live cost panel", body: "The right-hand panel recomputes on every change using the same kernel as the rest of the app — a single source of truth for every number." },
      { title: "Suggested price", body: "The suggested price is the menu price that would hit your target food cost % exactly, given the current cost per portion." },
    ],
    profitability: [
      { title: "Reading the ranking", body: "Dishes are sorted by food cost % and margin. Use Top / Bottom views to prioritize menu engineering." },
    ],
    reports: [
      { title: "Excel exports", body: "Download profitability, recipe book, or ingredient catalog as .xlsx. Files are also stored for ~30 days under your export history." },
    ],
    settings: [
      { title: "Target food cost %", body: "This is the line that separates on-target dishes from flagged ones. 28–35% is typical for full-service restaurants." },
      { title: "HT vs TTC", body: "Choose whether the menu prices you type already include sales tax. Food cost math uses the price exactly as you enter it." },
      { title: "Export or delete data", body: "Export all my data downloads a JSON copy anytime (including when locked). Deleting a workspace hides it immediately and purges it after 30 days." },
    ],
  },
  fr: {
    overview: [
      { title: "Lire vos indicateurs", body: "Le coût matière moyen % est la moyenne sur chaque plat avec prix. Visez sous votre cible ; les plats au-dessus du seuil sont comptés à part pour prioriser." },
      { title: "La checklist de départ", body: "Ajoutez des ingrédients, créez quelques recettes et définissez des prix de vente. Une fois chaque plat prixé, votre coût matière % devient pertinent." },
    ],
    ingredients: [
      { title: "Rendement % et pertes", body: "Le rendement est la portion utilisable après parage et déchets. Une laitue à 80 % de rendement coûte 25 % de plus par gramme utilisable que son prix d'achat ne le laisse croire." },
      { title: "Densité & poids unitaire", body: "À remplir seulement si vous achetez dans une dimension et utilisez dans une autre — ex. huile achetée au litre mais mesurée en grammes (densité), ou œufs à la pièce utilisés en grammes (poids unitaire)." },
      { title: "Changer un prix", body: "Modifier un prix d'achat recalcule instantanément chaque recette utilisant l'ingrédient, directement ou via une sous-recette." },
    ],
    recipes: [
      { title: "Panneau de coût en direct", body: "Le panneau de droite recalcule à chaque modification via le même kernel que le reste de l'app — une source unique de vérité pour chaque chiffre." },
      { title: "Prix suggéré", body: "Le prix suggéré est le prix de vente qui atteindrait exactement votre cible de coût matière %, compte tenu du coût par portion actuel." },
    ],
    profitability: [
      { title: "Lire le classement", body: "Les plats sont classés par coût matière % et marge. Utilisez les vues Top / Bottom pour prioriser l'ingénierie de menu." },
    ],
    reports: [
      { title: "Exports Excel", body: "Téléchargez rentabilité, livre de recettes ou catalogue ingrédients en .xlsx. Les fichiers restent ~30 jours dans l'historique d'exports." },
    ],
    settings: [
      { title: "Cible de coût matière %", body: "C'est la ligne qui sépare les plats dans la cible des plats signalés. 28–35 % est typique en restauration à table." },
      { title: "HT vs TTC", body: "Choisissez si les prix de vente saisis incluent déjà la taxe. Le calcul du coût matière utilise le prix tel que saisi." },
      { title: "Exporter ou supprimer", body: "Exporter toutes mes données télécharge un JSON à tout moment (y compris en lecture seule). Supprimer un espace le masque tout de suite et le purge après 30 jours." },
    ],
  },
};

export function HelpSlideOver({
  open,
  onClose,
  page,
}: {
  open: boolean;
  onClose: () => void;
  page: PageKey;
}) {
  const t = useTranslations("App.help");
  const locale = (useLocale() === "fr" ? "fr" : "en") as "en" | "fr";
  const articles = ARTICLES[locale][page] ?? ARTICLES[locale].overview;
  const [contactOpen, setContactOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("button, a, input, textarea")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button
        type="button"
        aria-label={t("close")}
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-slideover-title"
        className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-border bg-container p-6 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 id="help-slideover-title" className="text-lg font-semibold text-heading">
            {t("title")}
          </h2>
          <button type="button" onClick={onClose} className="text-sm text-text hover:text-heading">
            {t("close")}
          </button>
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-accent-text">
          {t("onThisPage")}
        </p>
        <div className="mt-3 flex-1 space-y-4 overflow-y-auto">
          {articles.map((a) => (
            <div key={a.title} className="rounded-lg border border-border-mute p-4">
              <h3 className="text-sm font-semibold text-heading">{a.title}</h3>
              <p className="mt-2 text-sm text-text">{a.body}</p>
            </div>
          ))}
          {contactOpen && (
            <div className="rounded-lg border border-border p-4">
              <h3 className="text-sm font-semibold text-heading">{t("contact")}</h3>
              <div className="mt-3">
                <SupportForm locale={locale} page={page} compact />
              </div>
            </div>
          )}
        </div>
        <button
          type="button"
          data-testid="help-contact"
          onClick={() => setContactOpen((v) => !v)}
          className="mt-4 block w-full rounded-xs border border-border px-3 py-2 text-center text-sm text-text hover:border-border-accent hover:text-heading"
        >
          {t("contact")}
        </button>
      </div>
    </div>
  );
}
