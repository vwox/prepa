# AGENTS.md — PrepaMariage

Page web du parcours de préparation au mariage de l'Abbaye de Lagrasse, refaite automatiquement depuis le Word / Google Doc du Père (P. Jean-Baptiste). Créé le 21/10/2026 par Blaise d'Estais ; fonctionnement détaillé dans [README.md](README.md).

## Règles

- **Le doc du Père est la seule source du contenu** : ne jamais réécrire, corriger ou résumer son texte, ni retirer un lien ; la page ne change que la mise en page. Après toute modification de `rendu.js`, vérifier que le texte et les liens sont identiques avant/après (même nombre de liens, mêmes caractères), et regarder la page à 390 px et 1 280 px.
- Les liens sont réservés aux fiancés inscrits : garder `noindex` et `robots.txt`, et ne jamais mettre le doc, la page générée ni l'identifiant du doc dans le dépôt (public). L'identifiant est le secret `DOC_ID` du dépôt (`gh secret set DOC_ID`).
- Interlocuteurs : le Père écrit en français, des mails courts ; réponses brèves.

## Repères techniques

- Découpage en vues (`rendu.js`, début de la boucle) : avant la première partie (titre 1 du Word), les blocs sont répartis par repères de texte (« Quatre avantages / Six conseils / Deux règles » → À savoir ; 1er enseignement → Pour commencer ; tableau et le paragraphe qui le précède → Par où commencer). Si le Père réorganise ce début, vérifier que chaque vue garde son contenu ; une vue vide disparaît du menu.

- Publication : GitHub Pages par GitHub Actions (`.github/workflows/mise-a-jour.yml`), cron toutes les 5 min (en pratique 5 à 15), plus chaque push sur `main`. Le cron d'un dépôt public s'arrête après 60 jours sans activité : le workflow pousse un commit vide tous les 50 jours.
- Mode « page à la main » (si le Père le demande) : retirer l'étape `construire` du workflow et versionner `site/` (retirer `site/` du `.gitignore`).
- Ancienne adresse `https://prepa-lagrasse.pages.dev` (Cloudflare Pages, compte de Blaise, code dans le dépôt Zita, `tmp/mails-2010/prepa/pages/`) : redirige ici depuis le 21/10/2026.
