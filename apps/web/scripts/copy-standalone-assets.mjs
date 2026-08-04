import { cpSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const standaloneApp = join(root, ".next/standalone/apps/web");

if (!existsSync(standaloneApp)) {
  console.error("✗ Dossier standalone introuvable — le build a-t-il bien généré .next/standalone ?");
  process.exit(1);
}

cpSync(join(root, ".next/static"), join(standaloneApp, ".next/static"), {
  recursive: true,
});
console.log("✓ .next/static copié");

if (existsSync(join(root, "public"))) {
  cpSync(join(root, "public"), join(standaloneApp, "public"), {
    recursive: true,
  });
  console.log("✓ public/ copié");
}

console.log("✓ Fichiers statiques copiés vers le dossier standalone");