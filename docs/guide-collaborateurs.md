# Modifier le site de la prépa mariage avec votre assistant

Guide vérifié les 26 et 27 octobre 2026. Prévoyez environ 5 à 10 minutes la première fois si vous avez déjà vos comptes et votre abonnement ; l'installation ou une autorisation de l'organisation GitHub peut demander un peu plus longtemps. Ensuite, vous décrivez simplement ce que vous voulez changer.

## D'abord : faut-il modifier le document ou le site ?

Pour changer un texte, un titre ou un lien du parcours, continuez à modifier le document partagé du Père : il reste la source du contenu, et le site le reprend automatiquement. Le délai peut être de quelques heures. Pour changer la présentation, la navigation ou ajouter une fonction, utilisez le projet [vwox/prepa](https://github.com/vwox/prepa) avec un assistant capable d'y travailler.

Chaque personne utilise son propre compte GitHub gratuit et son propre compte d'assistant. Acceptez l'invitation à `vwox/prepa`, puis choisissez **une seule** des possibilités ci-dessous, de préférence celle que vous utilisez déjà. L'accès GitHub ne donne pas, à lui seul, un abonnement à un assistant.

## Trois possibilités

| Vous utilisez… | Ce qu'il vous faut pour modifier le site | Première ouverture |
| --- | --- | --- |
| **ChatGPT / Codex** | **ChatGPT Plus** suffit pour accéder à GPT-6.1 Sol ; Pro convient aussi. Free et Go donnent actuellement accès à Luna, ce qui ne correspond pas au réglage conseillé pour ce chantier. | Sur le web, ouvrez **Codex**, choisissez **Cloud**, connectez GitHub, sélectionnez `vwox/prepa` et créez l'environnement si demandé. Prenez **GPT-6.1 Sol** ou **Astra**, effort **High / Extra High**. L'application Mac n'est pas nécessaire pour travailler dans le cloud. |
| **Claude** | **Claude Pro** suffit pour Claude Code ; Max convient aussi. Le compte gratuit permet de discuter, mais n'inclut pas Claude Code. | Ouvrez [claude.ai/code](https://claude.ai/code), connectez GitHub et sélectionnez `vwox/prepa`. Choisissez **Sonnet** ou **Opus**, avec **High / Extra High** lorsque proposé. Vous pouvez aussi utiliser la partie **Code** de l'application Claude sur Mac ou Windows. |
| **Gemini / Antigravity** | Pour **Gemini 4 Argon**, prenez **Google AI Pro payant** ou Ultra. Le compte gratuit Antigravity existe, mais n'inclut pas Argon ; ne prenez pas Flash pour cette modification. | Installez l'**application Antigravity** pour votre ordinateur et ouvrez-y une copie du projet GitHub. Choisissez **Gemini 4 Argon**, réflexion **High**. Attention : Argon est disponible dans l'application Antigravity, mais pas dans l'ancien produit nommé « Antigravity IDE ». |

Si le projet n'apparaît pas, vérifiez que vous avez accepté l'invitation avec le bon compte GitHub. Il peut aussi falloir que le Père ou un administrateur autorise l'application de votre assistant sur ce dépôt. Un simple accès de lecture dans un connecteur de conversation ne garantit pas que l'assistant puisse modifier et publier le site.

**Pour démarrer sans installation, choisissez Codex Cloud ou Claude Code sur le web.** Pour travailler directement dans les dossiers de votre ordinateur, il faut une application ou un outil local avec les permissions correspondantes ; l'assistant doit vous guider, sans vous demander de taper du code vous-même.

## Le message à copier dans votre assistant

> Je participe à la préparation au mariage de l'Abbaye de Lagrasse. Je souhaite vous confier des améliorations du site https://vwox.github.io/prepa/, dont le projet est https://github.com/vwox/prepa.
>
> Commencez par lire intégralement les fichiers AGENTS.md, CLAUDE.md s'il existe et README.md du projet, puis les instructions des sous-dossiers que vous devrez modifier. Vérifiez votre accès réel à la version actuelle du projet, à son historique et à la publication. Dites-moi clairement si vous pouvez seulement consulter le projet ou aussi le modifier et publier. Si une connexion manque, guidez-moi simplement, une étape à la fois. Je saisirai moi-même mes identifiants et les codes de connexion.
>
> Par défaut, parlez-moi en français courant, sans jargon ni explication technique inutile. Expliquez les conséquences pratiques et prenez en charge les opérations techniques. Ne me demandez un choix que si cela change réellement le résultat pour les fiancés ou l'équipe.
>
> Le document du Père reste la source du contenu tant que nous n'avons pas explicitement décidé de changer ce fonctionnement. Une demande de présentation ne vous autorise pas à réécrire le texte, supprimer un lien ou modifier le fond. Respectez les indications du projet sur les contenus réservés aux inscrits, le référencement et ce qui peut être publié dans ce dépôt public. Ne mettez jamais dans le dépôt les identifiants privés, mots de passe, données personnelles, document source ou page générée réservée.
>
> Regardez ce qui existe déjà et les dernières modifications avant d'intervenir. Conservez le travail des autres personnes. Faites la modification complète et la plus simple qui réponde à ma demande, puis vérifiez le résultat réel sur téléphone et ordinateur, sans son. Vérifiez particulièrement la conservation des textes et des liens, ainsi que les fonctions d'inscription et d'accès aux contenus si elles sont concernées.
>
> Avant une publication, montrez-moi le résultat et un aperçu vérifié, et attendez mon accord explicite. Après cet accord, publiez la version validée, vérifiez l'adresse publique et mettez à jour la documentation utile. Terminez par ce qui a changé, ce qui a été vérifié et ce qui reste éventuellement à faire.
>
> Ma demande est la suivante :

Ajoutez à la suite votre demande en quelques phrases, avec une capture d'écran si cela aide. Exemple : « Sur mon téléphone, je trouve difficile de repérer les enseignements consacrés à la communication. Rendez ce choix plus visible tout en gardant les textes du Père. »

## Références officielles vérifiées

- OpenAI : [abonnements et accès](https://learn.chatgpt.com/docs/pricing), [modèles et effort de réflexion](https://learn.chatgpt.com/docs/models), [connexion du projet à Codex Cloud](https://learn.chatgpt.com/docs/environments/cloud-environments).
- Anthropic : [Claude Code et les abonnements](https://claude.com/product/claude-code), [Claude Code dans le navigateur](https://code.claude.com/docs/en/claude-code-on-the-web), [application de bureau et disponibilité](https://support.claude.com/en/articles/10065433-install-claude-desktop).
- Google : [modèles et niveaux d'abonnement Antigravity](https://www.antigravity.google/docs/models/), [installation et ouverture d'un projet](https://www.antigravity.google/docs/getting-started/).

Les noms des menus, les modèles et les limites peuvent évoluer : si l'écran diffère, donnez ce guide à l'assistant et demandez-lui de vérifier la documentation officielle actuelle.
