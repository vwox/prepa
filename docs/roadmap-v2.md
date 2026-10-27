# Feuille de route V2 & questions ouvertes — Parcours de préparation au mariage

Mise à jour : 27 octobre 2026.

---

## 1. Déjà en ligne (V1.5 du 27 octobre 2026)

1. **Indexation enrichie à partir des questionnaires, supports et titres vidéos** (`index-ressources.json` + `interface.js`) :
   - Analyse des **125 documents liés** dans le parcours (47 questionnaires `.docx`, 4 `.doc`, 74 supports `.pdf`) et des **55 titres de vidéos YouTube**.
   - Chaque enseignement affiche désormais son ou ses **intervenants** directement dans l’index (*Index & recherche*) et dispose d’un filtre déroulant **Intervenant** dédié.
   - La barre de recherche interroge le texte de l’enseignement, les noms complets des intervenants (ex. *Maryvonne Pierre* remonte immédiatement les enseignements **6, 8, 10, 13 et 38**) ainsi que les mots-clés issus des questionnaires et des supports, sans jamais exposer les liens réservés dans le dépôt public.
2. **Suivi « Qui regarde ? » (`👥 À deux` par défaut / `👤 Lui` / `👤 Elle`)** :
   - **Bouton flottant en haut à droite** permettant de cocher *Lui*, *Elle* ou *À deux* (façon profils Netflix, mais avec la possibilité de cocher les deux personnes ensemble).
   - **Choix proposé dès la première validation du code (`3309`)** dans la fenêtre d’accès (réglé par défaut sur **À deux**), ce qui présente immédiatement la fonctionnalité aux fiancés.
   - Chacun peut ainsi conserver son propre historique (*À voir* / *Vu*) lorsqu’il écoute un topo seul, ou cocher *À deux* lorsqu’ils avancent ensemble (les étiquettes affichent *Vu à deux*, *Vu (Lui)* ou *Vu (Elle)*).
3. **Préparation technique de l’indexation partielle (`data-nosnippet`)** :
   - Les liens de ressources réservées et le détail déplié des fiches portent l’attribut `data-nosnippet` afin que Google n’affiche jamais les liens ou le contenu réservé dans ses extraits de recherche lorsque l’indexation publique sera ouverte.

---

## 2. Pistes à réaliser en V2

### A. Indexation partielle Google (modèle « presse / journal »)
- **Objectif** : faire remonter la page de présentation et d’inscription du parcours dans Google lorsqu’un couple cherche une préparation au mariage, tout en gardant les ressources réservées aux inscrits.
- **Fonctionnement cible** (identique aux sites de presse) :
  - **Indexé par Google** : titre, accroche, présentation du parcours, liste des 22 conférenciers, titres et thèmes des 53 enseignements, et bouton d’inscription.
  - **Non indexé / masqué par `data-nosnippet` et mire d’accès** : liens vers les vidéos, questionnaires et supports (et, demain, texte intégral des questionnaires ou transcriptions).
- **Activation** : dès que l’emplacement définitif est arrêté avec Maxence et le Père (intégration sur `preparation-au-mariage.lagrasse.org` ou sous-domaine `prepa.lagrasse.org`), retirer `<meta name="robots" content="noindex,nofollow">` et `Disallow: /` dans `robots.txt`, et ajouter les métadonnées Schema.org (`Course`).

### B. Inclusion des transcriptions des vidéos et de l’ensemble des questionnaires
- **Transcriptions des 55 vidéos** : extraire les sous-titres / transcriptions complètes des vidéos YouTube pour :
  1. permettre de retrouver un topo dans la barre de recherche à partir de n’importe quel exemple, citation ou sujet abordé à l’oral ;
  2. proposer éventuellement la transcription écrite en accordéon sous chaque enseignement (pour les inscrits).
- **Documents complémentaires** : si l’équipe partage un dossier Google Drive rassemblant tous les questionnaires et supports (y compris ceux qui ne seraient pas encore liés ou qui sont en cours de mise à jour), la construction pourra les indexer et les intégrer directement.

### C. Synchronisation multi-appareils du suivi *Lui / Elle / À deux*
- La V1 enregistre les repères *Lui / Elle / À deux* sur l’appareil utilisé (`localStorage`).
- En V2, si l’on souhaite que ce que coche *Lui* sur son téléphone apparaisse sur le téléphone d’*Elle* :
  - soit via la **connexion WordPress** des inscrits (évoquée par Maxence) ;
  - soit via un petit **code couple** léger sans création de compte supplémentaire.

---

## 3. Questions ouvertes d’architecture (à arbitrer avec le Père et Maxence)

1. **Intégration directe dans le site WordPress (*Parcours en ligne*) vs site séparé** *(question de Maxence)* :
   - Maintenir deux sites distincts avec des liens croisés et deux systèmes d’accès complique la maintenance (MCO).
   - Tout le moteur dynamique actuel (vues, *Index & recherche*, filtres, suivi *Lui / Elle / À deux*) tient en un seul fichier HTML/JS autonome : il peut être **intégré directement dans la page *Parcours en ligne* du WordPress de Lagrasse** (derrière une mire de connexion WordPress ou avec le code d’accès), sans serveur tiers à maintenir.
2. **CMS directement sur GitHub (en Markdown / HTML) et/ou simplification du Google Doc** :
   - Tant que le PDF principal existait, le Google Doc / Word devait porter toute la mise en page d’impression.
   - Si le PDF principal est abandonné au profit du site, et si l’on intègre directement sur le site le contenu de tous les questionnaires, les transcriptions des vidéos et de nouvelles fonctionnalités :
     - **Option 1 (Google Doc allégé)** : garder le Google Doc uniquement pour les contenus purs (titres, résumés, liens), sans se soucier de la mise en forme Word.
     - **Option 2 (CMS Markdown / HTML sur GitHub)** : gérer les fiches d’enseignement (titre, intervenants, vidéo, support, texte des 10 questions du questionnaire, transcription) directement en Markdown ou HTML propre sur GitHub, modifiable en langage naturel avec Claude / ChatGPT ou via une interface simple.
