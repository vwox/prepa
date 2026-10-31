# Feuille de route V2 & questions ouvertes — Parcours de préparation au mariage

Mise à jour : 31 octobre 2026 (recherche documentaire complète, accès et parcours public vérifiés).

---

## 1. Déjà en ligne (recherche complétée le 31 octobre 2026)

1. **Recherche des enseignements et des documents** (`index-documents.json`, `index-ressources.json`, `interface.js`) :
   - 189 originaux distincts issus des 194 références collectées : programme, annexes des deux dossiers Drive et contenu du ZIP. Les trois doublons sont réunis et les deux liens/fichiers invalides exclus de l’index ; le PDF correspondant à l’URL finissant par erreur en `.pd` est bien présent.
   - Résultats document par document, ouverture de la source, renvoi à l’enseignement, filtres et pagination. Le vocabulaire est propre à chaque pièce ; les 53 enseignements gardent leurs intervenants.
   - Schéma PNG et 26 pages TIFF complétés par lecture des légendes ; scans cherchables par texte extrait/OCR. L’audio reste repérable par son titre, sans transcription.
   - Pas de reprise automatique des modifications faites dans des copies Word sur Drive. La reconstruction automatique du programme et la mise à jour du lexique documentaire sont deux opérations différentes (procédure dans le README).
2. **Suivi « Qui regarde ? » (`👥 À deux` par défaut / `👤 Lui` / `👤 Elle`)** :
   - **Bouton flottant en haut à droite** permettant de cocher *Lui*, *Elle* ou *À deux* (façon profils Netflix, mais avec la possibilité de cocher les deux personnes ensemble).
   - **Choix proposé dès la première validation du code (`3309`)** dans la fenêtre d’accès (réglé par défaut sur **À deux**), ce qui présente immédiatement la fonctionnalité aux fiancés.
   - Chacun peut ainsi conserver son propre historique (*À voir* / *Vu*) lorsqu’il écoute un topo seul, ou cocher *À deux* lorsqu’ils avancent ensemble (les étiquettes affichent *Vu à deux*, *Vu (Lui)* ou *Vu (Elle)*).
3. **Préparation technique de l’indexation partielle (`data-nosnippet`)** :
   - Les liens de ressources réservées et le détail déplié des fiches portent l’attribut `data-nosnippet` pour exclure ces passages des extraits Google. Cet attribut ne bloque ni leur indexation ni leur accès : il ne constitue aucune protection des ressources.

---

## 2. Pistes à réaliser en V2

### A. Indexation partielle Google (modèle « presse / journal »)
- **Objectif** : faire remonter la page de présentation et d’inscription du parcours dans Google lorsqu’un couple cherche une préparation au mariage, tout en gardant les ressources réservées aux inscrits.
- **Fonctionnement cible** (identique aux sites de presse) :
  - **Indexé par Google** : titre, accroche, présentation du parcours, liste des 22 conférenciers, titres et thèmes des 53 enseignements, et bouton d’inscription.
  - **Réservé après contrôle serveur de l’inscription** : liens vers les vidéos, questionnaires et supports (et, demain, texte intégral des questionnaires ou transcriptions). Ne pas livrer ce contenu dans le HTML ni dans un index de recherche public. `data-nosnippet` ne retire que les extraits Google ; la mire actuelle et le code partagé ne protègent pas les URLs.
- **Activation** : seulement après séparation effective des contenus publics et réservés, contrôle des accès directs et choix de l’emplacement définitif avec Maxence et le Père, retirer `<meta name="robots" content="noindex,nofollow">` et `Disallow: /` dans `robots.txt`, et ajouter les métadonnées Schema.org (`Course`).

### B. Transcriptions des vidéos et nouveaux documents
- **Transcriptions des 55 vidéos** : extraire les sous-titres / transcriptions complètes des vidéos YouTube pour :
  1. permettre de retrouver un topo dans la barre de recherche à partir de n’importe quel exemple, citation ou sujet abordé à l’oral ;
  2. proposer éventuellement la transcription écrite en accordéon sous chaque enseignement (pour les inscrits).
- **Documents complémentaires** : les pièces accessibles dans le programme et les dossiers liés sont désormais indexées. Pour des ajouts ultérieurs ou des fichiers modifiés, reprendre l’extraction et reconstruire l’index ; l’édition des copies de lecture ne met pas à jour le site.

### C. Synchronisation multi-appareils du suivi *Lui / Elle / À deux*
- La V1 enregistre les repères *Lui / Elle / À deux* sur l’appareil utilisé (`localStorage`).
- En V2, si l’on souhaite que ce que coche *Lui* sur son téléphone apparaisse sur le téléphone d’*Elle* :
  - soit via la **connexion WordPress** des inscrits (évoquée par Maxence) ;
  - soit via un petit **code couple** léger sans création de compte supplémentaire.

---

## 3. Questions ouvertes d’architecture (à arbitrer avec le Père et Maxence)

1. **Intégration directe dans le site WordPress (*Parcours en ligne*) vs site séparé** *(question de Maxence)* :
   - Maintenir deux sites distincts avec des liens croisés et deux systèmes d’accès complique la maintenance (MCO).
   - Le rendu et la recherche actuels peuvent être repris dans une page WordPress. L’intégration des comptes n’est cependant pas définie : aucun code serveur, configuration d’inscription ou accès administrateur n’a été fourni ici. Il serait prématuré de promettre un « petit module » prêt à brancher.
   - Le parcours public vérifié utilise un compte de couple (UsersWP), puis l’inscription à un évènement (WP Event Manager, avec l’extension Registrations chargée). HelloAsso est présenté dans le programme comme le versement d’une offrande libre. Ni la validation de l’inscription, ni les mails déclenchés, ni un lien technique avec HelloAsso n’ont pu être contrôlés après connexion.
   - Pour préparer une intégration concrète, il faut le code et la configuration du site qui gère les inscriptions, puis un environnement où vérifier le parcours de bout en bout. Le site actuel et son code partagé restent utilisables pendant cette clarification. Une iframe ne protégerait pas la copie publique ni les fichiers sources.
2. **CMS directement sur GitHub (en Markdown / HTML) et/ou simplification du Google Doc** :
   - Tant que le PDF principal existait, le Google Doc / Word devait porter toute la mise en page d’impression.
   - Si le PDF principal est abandonné au profit du site, et si l’on intègre directement sur le site le contenu de tous les questionnaires, les transcriptions des vidéos et de nouvelles fonctionnalités :
     - **Option 1 (Google Doc allégé)** : garder le Google Doc uniquement pour les contenus purs (titres, résumés, liens), sans se soucier de la mise en forme Word.
     - **Option 2 (CMS Markdown / HTML)** : gérer les fiches d’enseignement (titre, intervenants, vidéo, support, questionnaires, transcription) en Markdown ou HTML dans un stockage privé, ou dans WordPress, modifiables en langage naturel avec Claude / ChatGPT ou via une interface simple. Le dépôt de code public ne doit pas héberger les contenus réservés. Si la conversion du document continue, publier un aperçu public et transférer la version réservée à WordPress par un accès serveur privé, sans conserver une copie complète accessible sur GitHub Pages.

## Contrôle des accès des 30 et 31 octobre 2026

Le compte `pjean-baptiste-hub` dispose de l’écriture sur le dépôt. L’invitation en écriture de `maxence-bobin`, créée le 27 octobre, est toujours en attente après contrôle API du 31 octobre et reste à accepter via https://github.com/vwox/prepa/invitations ; ne pas la renvoyer en doublon. Les comptes des couples et les inscriptions existent déjà sur WordPress : réutiliser ces données et ne pas créer une deuxième liste d’inscrits. Le Père peut continuer à déposer les sources par FTP ; migration de la diffusion et maintien de son mode d’édition sont deux décisions distinctes. Aucune migration ni installation de contrôle serveur n’a été faite lors de ce contrôle.

Références : [authentification REST WordPress](https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/), [shortcodes](https://developer.wordpress.org/plugins/shortcodes/), [portée de data-nosnippet](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag).


Parcours public contrôlé le 31 octobre, sans création de compte ni envoi : [présentation](https://preparation-au-mariage.lagrasse.org/parcours-en-ligne/), [création du compte](https://preparation-au-mariage.lagrasse.org/register/), [connexion](https://preparation-au-mariage.lagrasse.org/login/). Le paiement HelloAsso n’a pas été parcouru : son contrôle antirobot a arrêté le navigateur isolé ; aucune conclusion sur ses étapes ni sur sa liaison aux comptes.
