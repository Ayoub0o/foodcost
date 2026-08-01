import { calculatorContentEn, calculatorLabelsEn } from "@/content/calculator/en";
import { calculatorContentFr, calculatorLabelsFr } from "@/content/calculator/fr";
import type { ToolPageContent } from "@/components/tools/ToolPageLayout";
import type { CalculatorLabels } from "@/components/tools/FoodCostCalculator";

export const pourCostLabelsEn: CalculatorLabels = {
  ...calculatorLabelsEn,
  ingredient: "Bottle / mixer",
  trialCta: "Save pour recipes — start your free trial",
};

export const pourCostLabelsFr: CalculatorLabels = {
  ...calculatorLabelsFr,
  ingredient: "Bouteille / mixer",
  trialCta: "Sauver vos recettes bar — démarrer l'essai",
};

export const pourCostContentEn: ToolPageContent = {
  ...calculatorContentEn,
  hero: {
    h1: "Pour cost calculator for bars",
    trustLine: "Free · ml-first · no signup",
    intro:
      "Cost cocktails and pours from bottle millilitres to glass. Built on the same unit engine FoodCost uses for kitchen recipes.",
  },
  definition:
    "Pour cost is beverage food cost: the ingredient cost of a drink divided by its selling price. A pour cost calculator works in millilitres from bottle to glass so each serving stays inside your target margin.",
  benchmarks: {
    ...calculatorContentEn.benchmarks,
    title: "Typical pour cost bands",
    caption: "Bar operations benchmarks (illustrative)",
    rows: [
      { type: "Well drinks", pct: 20, range: "18–22%" },
      { type: "Cocktails", pct: 21, range: "18–24%" },
      { type: "Wine by glass", pct: 30, range: "25–35%" },
      { type: "Beer", pct: 24, range: "20–28%" },
    ],
  },
};

export const pourCostContentFr: ToolPageContent = {
  ...calculatorContentFr,
  hero: {
    h1: "Calculateur de coût matière bar (pour cost)",
    trustLine: "Gratuit · orienté ml · sans compte",
    intro:
      "Costez cocktails et services de la bouteille au verre. Même moteur d'unités que FoodCost en cuisine.",
  },
  definition:
    "Le coût matière bar (pour cost) est le food cost des boissons : coût d'une boisson divisé par son prix de vente. Le calculateur travaille en millilitres, de la bouteille au verre, pour rester dans la marge cible.",
  benchmarks: {
    ...calculatorContentFr.benchmarks,
    title: "Fourchettes typiques de pour cost",
    caption: "Repères bar (illustratif)",
    rows: [
      { type: "Well / premiers prix", pct: 20, range: "18–22 %" },
      { type: "Cocktails", pct: 21, range: "18–24 %" },
      { type: "Vin au verre", pct: 30, range: "25–35 %" },
      { type: "Bière", pct: 24, range: "20–28 %" },
    ],
  },
};
