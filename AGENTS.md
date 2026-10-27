# AGENTS.md — PrepaMariage

Page web du parcours de préparation au mariage de l'Abbaye de Lagrasse, refaite automatiquement depuis le Word / Google Doc du Père (P. Jean-Baptiste). Créé le 21/10/2026 par Blaise d'Estais, dans l'organisation GitHub `vwox` (nom court sans signification, choisi pour une adresse du type raccourcisseur : `vwox.github.io/<site>`) ; fonctionnement détaillé dans [README.md](README.md).

## Règles

- **Le doc du Père est la seule source du contenu** : ne jamais réécrire, corriger ou résumer son texte, ni retirer un lien ; la page ne change que la mise en page. Après toute modification de `rendu.js`, vérifier que le texte et les liens sont identiques avant/après (même nombre de liens, mêmes caractères), et regarder la page à 390 px et 1 280 px.
- **Accès, recherche enrichie et suivi par personne (27/10/2026)** : `interface.js` ajoute le code partagé (rappel d’inscription, pas une sécurité), le catalogue/recherche/filtres enrichi avec les intervenants et le vocabulaire des 125 questionnaires et supports (`index-ressources.json`, sans aucune URL réservée), et le sélecteur « Qui regarde ? » (`À deux` par défaut, `Lui`, `Elle`) pour les repères À voir/Vu en local. Ne pas annoncer de comptes ni de synchronisation. Préserver les liens dans `data-ressource` quand ils sont verrouillés, et dans `href` quand ils sont ouverts ; les vérifier tous avant/après. L’empreinte de construction inclut `rendu.js`, `interface.js` et `index-ressources.json`. Guide équipe : [docs/guide-collaborateurs.md](docs/guide-collaborateurs.md) ; feuille de route V2 : [docs/roadmap-v2.md](docs/roadmap-v2.md).
- Les liens sont réservés aux fiancés inscrits : garder `noindex` et `robots.txt`, et ne jamais mettre le doc, la page générée ni l'identifiant du doc dans le dépôt (public). L'identifiant est le secret `DOC_ID` du dépôt (`gh secret set DOC_ID`).
- Interlocuteurs : le Père (compte GitHub `pjean-baptiste-hub`, admin du dépôt) écrit en français, des mails courts ; réponses brèves. Le doc source est son Word du Drive `1mc1HG-…`, ouvert en lecture à tous ceux qui ont le lien depuis le 22/10/2026.
- Choix en attente du Père (mail du 23/10/2026) : garder la page tirée du doc, ou passer à un vrai site libre (même contenu réorganisé, modifié via Claude, plus via le doc).

## Repères techniques

- Découpage en vues (`rendu.js`, début de la boucle) : avant la première partie (titre 1 du Word), les blocs sont répartis par repères de texte (« Quatre avantages / Six conseils / Deux règles » → À savoir ; 1er enseignement → Pour commencer ; tableau et le paragraphe qui le précède → Par où commencer). Si le Père réorganise ce début, vérifier que chaque vue garde son contenu ; une vue vide disparaît du menu.

- Publication : GitHub Pages par GitHub Actions (`.github/workflows/mise-a-jour.yml`), cron toutes les 5 min mais GitHub ne le lance en pratique que toutes les 2 à 5 h (mesuré les 21-23/10/2026), plus chaque push sur `main` et `workflow_dispatch`. Pour du vrai « toutes les 5 min », il faudrait un déclencheur externe (ex. cron Cloudflare appelant `workflow_dispatch` avec un jeton limité à ce dépôt, à créer par Blaise). Le cron d'un dépôt public s'arrête après 60 jours sans activité : le workflow pousse un commit vide tous les 50 jours.
- Mode « page à la main » (si le Père le demande) : retirer l'étape `construire` du workflow et versionner `site/` (retirer `site/` du `.gitignore`).
- Ancienne adresse `https://prepa-lagrasse.pages.dev` (Cloudflare Pages, compte de Blaise, code dans le dépôt Zita, `tmp/mails-2010/prepa/pages/`) : redirige ici depuis le 21/10/2026.
