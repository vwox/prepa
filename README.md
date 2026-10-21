# Parcours en ligne de préparation au mariage — Abbaye Sainte-Marie de Lagrasse

La page **https://blaisedestais.github.io/PrepaMariage/** se refait toute seule à partir du Word / Google Doc du parcours.

## Pour le Père : rien à faire de plus

1. Vous modifiez votre Word / Google Doc comme d'habitude.
2. La page se met à jour toute seule, en général en 5 à 15 minutes (GitHub vérifie le doc toutes les 5 minutes, sans garantie d'heure exacte).
3. Si le doc est momentanément illisible (partage retiré, Google en panne), la page garde sa dernière version : elle ne disparaît jamais.

Une seule condition : le doc doit être ouvert en lecture (Partager › Accès général › « Tous les utilisateurs qui ont le lien » › **Lecteur**).

Pour une grosse refonte du doc, travaillez sur une copie (Fichier › Créer une copie), puis remplacez : ce que vous tapez dans le doc apparaît sur la page.

## Ce que la page fait du doc

Le texte et les liens du doc sont repris tels quels ; seule la mise en page change :

- couverture avec la première photo, sommaire collant en haut, chiffres clés en pastilles, pictos remplacés par des icônes ;
- un encart par enseignement, numéro en pastille ; badge « WE » pour l'astérisque (conférences des WE à Lagrasse) ;
- **couleurs des thèmes** : chaque ligne colorée du tableau « Si vous êtes pressés… » donne sa couleur aux numéros qu'elle cite (deux thèmes = pastille bicolore) ; la couleur est celle de la ligne dans le Word, ou, si le Word n'en a pas, celle d'origine (or : théologique, bleu nuit : essentiel, vert : crises, rose : sexualité, bleu : temps et argent) ;
- conférenciers en liste, sous le titre « Les conférenciers » ;
- accroche « Préparer son mariage à notre époque » en capitales ;
- citations des papes : auteur en gras, ouvrage en italique (l'italique du Word), sur une ligne à part ;
- adresse et contacts de l'abbaye tout en bas de la page.

## Changer la mise en page, ou faire d'autres sites

Tout est dans ce dépôt ; demandez à Claude (Claude Code), il sait s'y retrouver (voir [AGENTS.md](AGENTS.md)) :

- **mise en page** (couleurs, polices, ordre des blocs…) : fichier `rendu.js` ; une modification publiée ici repart en ligne en 1 à 2 minutes, et le contenu continue de venir du doc ;
- **page écrite à la main** plutôt que tirée du doc : possible aussi, il suffit de le demander à Claude (on coupe alors le lien avec le doc) ;
- **autres mini-sites** (WE fiancés, Cana…) : un dépôt par site, sur le même modèle, gratuit.

## Adresse à votre nom

On peut remplacer `blaisedestais.github.io/PrepaMariage` par une adresse du type `prepa.lagrasse.org` : votre webmestre ajoute dans la zone DNS de lagrasse.org un enregistrement `CNAME prepa → blaisedestais.github.io`, puis on renseigne l'adresse dans Settings › Pages › Custom domain (https automatique). Doc GitHub : [Gérer un domaine personnalisé](https://docs.github.com/fr/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## Fonctionnement (pour les curieux)

- `.github/workflows/mise-a-jour.yml` : toutes les 5 minutes, GitHub lance `construire.mjs`.
- `construire.mjs` télécharge le doc (identifiant dans le secret `DOC_ID` du dépôt), compare son empreinte avec celle de la page en ligne (`version.txt`) et ne republie que si quelque chose a changé.
- `rendu.js` transforme le Word en page web (une seule page, images intégrées).
- Essai sur l'ordinateur : `npm ci` puis `node construire.mjs mon-fichier.docx` → `site/index.html`.

La page n'est pas référencée par les moteurs de recherche (`noindex`, `robots.txt`) : seuls ceux qui ont le lien y vont. Le dépôt est public (condition de GitHub Pages gratuit) mais ne contient ni le doc ni la page, seulement le code.
