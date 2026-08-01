import { calculatorContentEn, calculatorLabelsEn } from "@/content/calculator/en";
import { calculatorContentFr, calculatorLabelsFr } from "@/content/calculator/fr";
import type { ToolPageContent } from "@/components/tools/ToolPageLayout";

export const menuCostLabelsEn = calculatorLabelsEn;
export const menuCostLabelsFr = calculatorLabelsFr;

export const menuCostContentEn: ToolPageContent = {
  ...calculatorContentEn,
  hero: {
    h1: "Menu cost calculator — price dishes from real plate cost",
    trustLine: "Free · no signup · menu price focused",
    intro:
      "Turn ingredient packs into menu price suggestions. Same FoodCost kernel as the product — built for chefs setting or revising a menu.",
  },
  definition:
    "A menu cost calculator converts purchase packs and yields into cost per portion, then suggests a menu price from your target food cost percentage so every dish on the card stays inside margin.",
};

export const menuCostContentFr: ToolPageContent = {
  ...calculatorContentFr,
  hero: {
    h1: "Calculateur de coût de menu — tarifer depuis le coût réel",
    trustLine: "Gratuit · sans compte · orienté prix de carte",
    intro:
      "Transformez conditionnements et rendements en prix de vente suggérés. Même kernel FoodCost que le produit — pour composer ou réviser une carte.",
  },
  definition:
    "Un calculateur de coût de menu convertit conditionnements et rendements en coût par portion, puis suggère un prix de vente selon votre cible de food cost % pour garder chaque plat dans la marge.",
};
