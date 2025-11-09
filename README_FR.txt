# Configurateur PC — Pipeline simple (FR)

## Objectif
- Avoir **une grande base** de composants au format **JSON**.
- Mettre ces fichiers **à jour automatiquement** (tous les jours).
- Les **charger dans votre page HTML** sans serveur compliqué.

## Vue d’ensemble
- `index.html` : le configurateur qui **lit** `/catalog/*.json`.
- `scripts/build-catalog.mjs` : génère les JSON à partir des **adapters**.
- `scripts/adapters/*.mjs` : connecteurs vers des sources (APIs, CSV, etc.).
- `.github/workflows/catalog.yml` : **GitHub Actions** reconstruit et pousse les JSON chaque jour.

---

## Étapes (faciles)

### 1) Ouvrir en local
- Téléchargez ce dossier, double‑cliquez sur `index.html` → ça marche déjà, avec quelques pièces (exemple).

### 2) Créer un dépôt GitHub
1. Créez un repo, uploadez tout le dossier.
2. Activez GitHub Actions (onglet **Actions**). Le workflow `Build catalog (daily)` apparaîtra.

### 3) Laisser la mise à jour automatique
- Par défaut, l’adapter d’exemple écrit quelques pièces.
- **Tous les jours** à 03:00 UTC, l’action relance `node scripts/build-catalog.mjs` et **commite** `catalog/*.json` mis à jour.

### 4) Charger les données depuis GitHub
- Dans `index.html`, cherchez `BASE_URL` et remplacez `./catalog` par :  
  `https://raw.githubusercontent.com/<votre_user>/<votre_repo>/main/catalog`
- *Astuce* : si vous créez une branche dédiée (`catalog`), pointez vers cette branche.

### 5) Ajouter des vraies sources (simple)
Ouvrez `scripts/adapters/example-static.mjs` et **remplacez** par de vrais fetchs. Idées propres et faciles :

- **Fichiers CSV/Excel** officiels (fabricants) que vous déposez dans `data/` du repo, puis vous les lisez et mappez.
- **Open ICEcat** (catalogue produits ouvert) : nécessite un compte gratuit, fournit des fiches techniques. Parsez leurs **exports** (évitez le scraping HTML).
- **Vos propres listes** en CSV : plus simple au début.

> Évitez le scraping agressif de sites marchands (souvent interdit par leurs CGU). Privilégiez des sources ouvertes ou vos fichiers.

### 6) Exemple d’adapter CSV (facile)
Ajoutez un fichier `data/cpus.csv` (colonnes: brand,model,socket,tdp). Créez `scripts/adapters/csv-cpus.mjs` :
```js
import { readFile } from "node:fs/promises";
export async function fetchCpusFromCsv(){
  const raw = await readFile("data/cpus.csv","utf-8");
  const lines = raw.trim().split(/\r?\n/);
  const out = [];
  const [h,...rows] = lines; // ignore header
  for(const r of rows){
    const [brand,model,socket,tdp] = r.split(",");
    out.push({ id:`cpu-${brand}-${model}`.toLowerCase().replace(/[^a-z0-9]+/g,"-"),
               brand, model, socket, tdp: Number(tdp) || 65 });
  }
  return out;
}
```
Dans `build-catalog.mjs` :
```js
import { fetchCpusFromCsv } from "./adapters/csv-cpus.mjs";
// ...
cpus: await fetchCpusFromCsv(),
```

### 7) Publier la page
- Activez **GitHub Pages** (Settings → Pages) et servez `index.html` depuis la branche `main`/`docs` ou un dossier `/docs`.
- Ou hébergez `index.html` n’importe où (c’est un fichier unique).

---

## Ce que vous avez à faire (résumé)
1. **Fork** ce projet.
2. Modifiez `BASE_URL` dans `index.html` pour pointer vers votre repo.
3. Remplacez l’adapter d’exemple par un adapter **CSV** simple (ou Open ICEcat si vous avez un compte).
4. Laissez **GitHub Actions** régénérer le catalogue tous les jours.

C’est tout. Pas de serveur complexe, pas de base de données au début. Quand vous serez à l’aise, on pourra migrer vers une vraie base (PostgreSQL + Prisma) et des adapters plus puissants.
