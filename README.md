# Parcours en ligne de préparation au mariage — Abbaye Sainte-Marie de Lagrasse

La page **https://vwox.github.io/prepa/** se refait toute seule à partir du Word / Google Doc du parcours.

## Pour le Père : rien à faire de plus

1. Vous modifiez votre Word / Google Doc comme d'habitude.
2. La page se met à jour toute seule, en général dans les heures qui suivent : GitHub est réglé pour vérifier le doc toutes les 5 minutes, mais espace en réalité ses tâches planifiées (mesuré les 21-23/10/2026 : une vérification toutes les 2 à 5 heures). Pour une mise à jour immédiate : onglet **Actions** du dépôt › « Mise à jour de la page » › **Run workflow** (1 minute).
3. Si le doc est momentanément illisible (partage retiré, Google en panne), la page garde sa dernière version : elle ne disparaît jamais.

Une seule condition : le doc doit être ouvert en lecture (Partager › Accès général › « Tous les utilisateurs qui ont le lien » › **Lecteur**).

Pour une grosse refonte du doc, travaillez sur une copie (Fichier › Créer une copie), puis remplacez : ce que vous tapez dans le doc apparaît sur la page.

## Ce que la page fait du doc

Le texte et les liens du doc sont repris tels quels ; seule la mise en page change :

- **accueil court** (retour d'Anne et Mechtilde) : couverture, chiffres clés, accroche, inscription, puis des cartes vers chaque partie ; menu collant en haut, une partie affichée à la fois : « Par où commencer ? » (le tableau : chaque ligne ouvre la liste de ses enseignements), « Pour commencer » (1er et 2e enseignements, prière, tests, entretiens), une vue par partie du Word, « À savoir » (conférenciers, citations, avantages, conseils, règles, règlement) ;
- pictos remplacés par des icônes ;
- un encart par enseignement, numéro en pastille ; badge « WE » pour l'astérisque (conférences des WE à Lagrasse) ;
- **couleurs des thèmes**, avec leur nom écrit sur chaque enseignement (« L'essentiel », « Crises »…) et une légende cliquable : chaque ligne colorée du tableau « Si vous êtes pressés… » donne sa couleur aux numéros qu'elle cite (deux thèmes = pastille bicolore) ; la couleur est celle de la ligne dans le Word, ou, si le Word n'en a pas, celle d'origine (or : théologique, bleu nuit : essentiel, vert : crises, rose : sexualité, bleu : temps et argent) ;
- conférenciers en liste, sous le titre « Les conférenciers » ;
- accroche « Préparer son mariage à notre époque » en capitales ;
- citations des papes : auteur en gras, ouvrage en italique (l'italique du Word), sur une ligne à part ;
- adresse et contacts de l'abbaye tout en bas de la page.

## Trouver un sujet et garder ses repères

Depuis le 27 octobre 2026, **Index & recherche** rassemble tous les enseignements dans une seule liste : recherche dans le texte intégral (accents facultatifs), filtres par partie et thème du document, ordre du programme ou alphabétique, affichage en liste ou avec tous les détails ouverts. Cliquer sur un enseignement ouvre son texte intégral et ses ressources. Les titres de l’index sont tirés du début de chaque enseignement ; aucun texte du Père n’est réécrit.

Les boutons **À voir** et **Vu** gardent les repères dans le navigateur de l’appareil. Ils restent disponibles en revenant sur le site, mais ne se synchronisent pas avec un autre téléphone ou ordinateur. Si le navigateur refuse le stockage local, ils fonctionnent pour la visite en cours et la page le signale. Ce ne sont pas des comptes utilisateurs.

## Inscription et code d’accès

Le programme reste consultable avant l’inscription. Les liens vers les conférences, questionnaires, supports et autres ressources du document demandent le code partagé reçu lors de l’inscription ; le lien d’inscription et les contacts restent ouverts. Le code est mémorisé dans ce navigateur. **Fermer mon accès** le retire de cet appareil. Le formulaire d’inscription de Lagrasse et l’offrande restent gérés sur le site existant.

Ce code est un rappel d’inscription, **pas un contrôle de sécurité** : le code et les URL peuvent être retrouvés par une personne qui examine la page. Une véritable protection et des comptes synchronisés demanderaient un service côté serveur et un raccordement à la base des inscriptions. `noindex` et `robots.txt` demandent aux moteurs de ne pas référencer la page ; ils n’empêchent ni l’accès public ni le partage du lien.

Pour les personnes qui modifient la présentation avec un assistant : [guide de première prise en main](docs/guide-collaborateurs.md) (comptes, applications, modèles et message à copier).

## Changer la mise en page, ou faire d'autres sites

Tout est dans ce dépôt ; demandez à Claude (Claude Code), il sait s'y retrouver (voir [AGENTS.md](AGENTS.md)) :

- **mise en page** (couleurs, polices, ordre des blocs…) : fichiers `rendu.js` (transformation du document) et `interface.js` (accès, recherche, suivi et présentation complémentaire) ; une modification publiée ici repart en ligne en 1 à 2 minutes, et le contenu continue de venir du doc ;
- **page écrite à la main** plutôt que tirée du doc : possible aussi, il suffit de le demander à Claude (on coupe alors le lien avec le doc) ;
- **autres mini-sites** (WE fiancés, Cana…) : un dépôt par site dans l'organisation GitHub `vwox`, sur le même modèle, gratuit ; le dépôt `vwox/cana` donne l'adresse `vwox.github.io/cana`.

## Adresse à votre nom

On peut remplacer `vwox.github.io/prepa` par une adresse du type `prepa.lagrasse.org` : votre webmestre ajoute dans la zone DNS de lagrasse.org un enregistrement `CNAME prepa → vwox.github.io`, puis on renseigne l'adresse dans Settings › Pages › Custom domain (https automatique). Doc GitHub : [Gérer un domaine personnalisé](https://docs.github.com/fr/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## Fonctionnement (pour les curieux)

- `.github/workflows/mise-a-jour.yml` : réglé toutes les 5 minutes (en pratique toutes les 2 à 5 heures), à chaque modification du dépôt et à la demande (Run workflow), GitHub lance `construire.mjs`.
- `construire.mjs` télécharge le doc (identifiant dans le secret `DOC_ID` du dépôt), compare son empreinte avec celle de la page en ligne (`version.txt`) et ne republie que si quelque chose a changé.
- `rendu.js` transforme le Word en page web (une seule page, images intégrées).
- Essai sur l'ordinateur : `npm ci` puis `node construire.mjs mon-fichier.docx` → `site/index.html`.

La page demande aux moteurs de ne pas la référencer (`noindex`, `robots.txt`) ; elle est néanmoins publique et son lien peut être partagé. Le dépôt est public (condition de GitHub Pages gratuit) mais ne contient ni le doc ni la page, seulement le code.
