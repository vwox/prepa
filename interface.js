// Navigation et accès aux ressources. Aucun contenu éditorial n'est réécrit.
// Le code partagé est un rappel d'inscription, pas une authentification sécurisée.
const INSCRIPTION = 'https://preparation-au-mariage.lagrasse.org/parcours-en-ligne/';

export function ameliorerPage(html) {
  // Retirer les destinations actives avant même que JavaScript se lance, y compris pour un clic du milieu.
  // Les URL restent dans la page : ce site statique ne prétend pas empêcher leur extraction.
  html = html.replace(/<a href="([^"]+)" target="_blank" rel="noopener">/g, (ancre, url) => {
    if (/^(mailto:|tel:)/i.test(url) || /^https?:\/\/(www\.)?lagrasse\.org\/?$/i.test(url)
      || /^https?:\/\/preparation-au-mariage\.lagrasse\.org\/(parcours-en-ligne\/?)?(?:[?#].*)?$/i.test(url)) return ancre;
    return `<a href="#acces" data-ressource="${url}" class="reserve" aria-haspopup="dialog" title="Ressource réservée aux inscrits">`;
  });
  html = html.replace('<nav class="menu">', '<nav class="menu" aria-label="Parcourir la préparation">');
  html = html.replace('</nav>\n<section class="vue"', '<a href="#catalogue">Index &amp; recherche</a></nav>\n<section class="vue"');
  html = html.replace('<h2>Le parcours</h2>', `<aside class="invitation" aria-labelledby="invitation-titre"><div><p class="surtitre">Un parcours à votre rythme</p><h2 id="invitation-titre">Découvrez le programme.<br>Préparez votre mariage ensemble.</h2><p>Explorez les enseignements librement. Inscrivez-vous pour accéder aux conférences, questionnaires et supports, avec l’accord de ceux qui vous préparent au mariage.</p><div class="invitation-actions"><a class="bouton primaire" href="${INSCRIPTION}" target="_blank" rel="noopener">S’inscrire au parcours <span aria-hidden="true">↗</span></a><button type="button" class="bouton discret" data-ouvrir-acces>Déjà inscrit ? Entrer mon code</button></div><p class="etat-acces" data-etat-acces>Le code vous est communiqué lors de votre inscription.</p></div></aside><div class="entete-parcours"><h2>Le parcours</h2><a href="#catalogue">Rechercher un sujet <span aria-hidden="true">→</span></a></div>`);
  html = html.replace('<footer>', `${catalogueEtAcces()}<footer>`);
  html = html.replace('</style>', `${styles}\n</style>`);
  html = html.replace('lucide.createIcons();', 'if (window.lucide) lucide.createIcons();');
  return html.replace('</body>', () => `<script>${script}</script></body>`);
}

function catalogueEtAcces() {
  return `<section class="vue" id="catalogue" hidden><div class="contenu catalogue"><p class="surtitre">Votre médiathèque conjugale</p><h2>Un sujet, un enseignement</h2><p>Retrouvez un thème, parcourez le programme ou gardez les enseignements à voir.</p><div class="outils-catalogue"><label class="recherche">Rechercher dans tout le programme<input type="search" id="recherche" placeholder="Un sujet, un mot, un intervenant…" autocomplete="off"></label><div class="filtres-catalogue"><label>Partie<select id="filtre-partie"><option value="">Toutes les parties</option></select></label><label>Thème<select id="filtre-theme"><option value="">Tous les thèmes</option></select></label><label>Afficher<select id="filtre-suivi"><option value="">Tout le programme</option><option value="aVoir">À voir</option><option value="vu">Déjà vus</option><option value="nonVu">Pas encore vus</option></select></label><label>Ordre<select id="tri"><option value="programme">Du programme</option><option value="alpha">Alphabétique A → Z</option></select></label></div><div class="ligne-catalogue"><p id="compte-resultats" role="status" aria-live="polite"></p><fieldset class="mode-affichage"><legend class="sr-only">Affichage des enseignements</legend><label><input type="radio" name="affichage" value="liste" checked> Liste</label><label><input type="radio" name="affichage" value="details"> Détails</label></fieldset></div></div><p class="note-locale" id="note-locale">Vos repères « À voir » et « Vu » restent dans ce navigateur, sur cet appareil. Ils ne se synchronisent pas avec vos autres appareils.</p><div id="catalogue-liste"></div><div id="resultats-reperes"></div><p id="aucun-resultat" hidden>Aucun enseignement ne correspond. Essayez un autre mot ou retirez un filtre.</p><button type="button" class="bouton discret" id="effacer-filtres">Réinitialiser les filtres</button></div></section>
<div class="barre-acces"><span data-barre-etat>Conférences et supports réservés aux inscrits</span><button type="button" data-ouvrir-acces>Entrer mon code <span aria-hidden="true">→</span></button><button type="button" id="verrouiller" hidden>Fermer mon accès</button></div>
<dialog id="dialogue-acces" aria-labelledby="acces-titre" aria-describedby="acces-explication"><button type="button" class="fermer-dialogue" id="fermer-acces" aria-label="Fermer">×</button><p class="surtitre">Le parcours complet</p><h2 id="acces-titre">Préparer votre mariage,<br>un pas après l’autre.</h2><p id="acces-explication">Les conférences, questionnaires et supports sont réservés aux fiancés inscrits. L’inscription se fait avec l’accord de ceux qui vous préparent au mariage ; l’offrande est libre.</p><a class="bouton primaire" href="${INSCRIPTION}" target="_blank" rel="noopener">S’inscrire au parcours <span aria-hidden="true">↗</span></a><div class="separation"><span>Déjà inscrit ?</span></div><form id="formulaire-acces"><label for="code-acces">Entrez le code reçu lors de votre inscription</label><div class="saisie-code"><input id="code-acces" name="code" type="text" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="off" placeholder="4 chiffres" aria-describedby="erreur-acces" required><button class="bouton primaire" type="submit">Ouvrir mon accès</button></div><p id="erreur-acces" role="alert"></p></form><p class="note-locale">L’accès est mémorisé dans ce navigateur. Merci de ne pas transmettre les liens ni le code à des personnes non inscrites.</p></dialog>
<noscript><p class="sans-js">Activez JavaScript pour rechercher dans le parcours et entrer votre code d’accès. <a href="${INSCRIPTION}">S’inscrire au parcours</a>.</p></noscript>`;
}

const styles = String.raw`
:root{--fond:#f8f6f0;--ligne:#e2dfd5;--peche:#cba675;--peche-fonce:#8b632f}
html{scroll-behavior:smooth;scroll-padding-top:90px}body{padding-bottom:60px}button,input,select{font:inherit}button,a,input,select,summary{-webkit-tap-highlight-color:transparent}button{cursor:pointer}button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,summary:focus-visible{outline:3px solid #bc8d4e;outline-offset:4px}button{color:var(--nuit)}[hidden]{display:none!important}nav.menu{padding:12px max(20px,calc((100vw - 1120px)/2));gap:6px}nav.menu a{border-color:transparent;padding:8px 12px;font:700 13px Lato,Arial,sans-serif}.hero{min-height:480px}.hero .in{max-width:1000px;padding:60px 28px 44px}.hero h1{font-size:clamp(30px,5vw,48px);max-width:750px;letter-spacing:-1px}.hero p{max-width:620px}.contenu{max-width:1000px;padding:22px 28px 56px}.hero::after{background:linear-gradient(180deg,rgba(19,27,58,.05),rgba(19,27,58,.92))}h2{letter-spacing:-.6px}.surtitre{font:700 11px/1.5 Montserrat,Arial,sans-serif;text-transform:uppercase;letter-spacing:.15em;color:var(--peche-fonce);margin:0 0 10px}.invitation{margin:30px 0 38px;border:1px solid #d9cebb;border-radius:20px;background:linear-gradient(115deg,#fffdf8,#f2eadc);padding:30px}.invitation h2{border:0;padding:0;margin:0 0 16px;font-size:clamp(23px,4vw,31px);line-height:1.25}.invitation p{max-width:700px}.invitation-actions{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin:22px 0 14px}.bouton{display:inline-flex;align-items:center;justify-content:center;gap:16px;border-radius:9px;padding:12px 17px;min-height:46px;border:1px solid var(--nuit);font:700 14px/1.4 Lato,Arial,sans-serif}.bouton.primaire{background:var(--nuit);color:white;border-color:var(--nuit)}.bouton.primaire:hover{background:#151e49}.bouton.discret{background:transparent;border-color:#d3c9b8}.bouton.discret:hover{background:#eee8dc}.etat-acces{font-size:13px;color:var(--gris);margin:0}.entete-parcours{display:flex;align-items:center;justify-content:space-between;gap:20px}.entete-parcours h2{border:0;margin-top:10px}.entete-parcours>a{font-size:14px;white-space:nowrap}.cartes{gap:14px}.carte{padding:21px;border-radius:12px}.carte strong{font-size:15px;margin-bottom:9px}.carte:hover{box-shadow:0 5px 18px #232b5e0b;border-color:#cba675}a.reserve{border-bottom-style:dotted}.barre-acces{position:fixed;z-index:6;bottom:0;left:0;right:0;display:flex;align-items:center;justify-content:center;gap:20px;min-height:56px;padding:10px 18px;background:#fffefb;border-top:1px solid var(--ligne);box-shadow:0 -3px 18px #232b5e08;font-size:13px}.barre-acces button{border:0;background:none;font-weight:700;padding:7px 0;white-space:nowrap}.barre-acces.ouvert{background:#edf3ea}.note-locale{font-size:12px;line-height:1.6;color:var(--gris)}dialog{border:0;border-radius:20px;padding:34px;max-width:520px;width:calc(100% - 32px);max-height:calc(100dvh - 32px);overflow:auto;color:var(--texte);background:var(--fond);box-shadow:0 25px 100px #07102c66}dialog::backdrop{background:#111a3bb3;backdrop-filter:blur(3px)}dialog h2{font-size:25px;line-height:1.25;margin:12px 0 18px;border:0}dialog>p{font-size:15px}dialog>.bouton{display:flex}.fermer-dialogue{position:absolute;right:13px;top:9px;border:0;background:none;font-size:27px;width:40px;height:40px}.separation{display:flex;align-items:center;gap:14px;color:var(--gris);font-size:12px;margin:24px 0 20px}.separation::before,.separation::after{content:'';height:1px;background:var(--ligne);flex:1}#formulaire-acces label{font-size:14px;font-weight:700}.saisie-code{display:flex;gap:8px;margin-top:9px}.saisie-code input{min-width:0;width:140px;flex:1;border:1px solid #beb8ac;background:#fff;border-radius:8px;padding:10px 12px;font-size:20px;letter-spacing:.18em}.saisie-code input::placeholder{font-size:13px;letter-spacing:0}#erreur-acces{color:#a2372d;font-size:13px;margin:8px 0 12px;min-height:20px}.catalogue h2{margin-top:8px}.outils-catalogue{background:#fff;border:1px solid var(--ligne);border-radius:14px;padding:20px;margin:22px 0 12px}.outils-catalogue label{display:block;font-size:12px;font-weight:700;color:var(--gris)}.outils-catalogue input[type=search],.outils-catalogue select{display:block;width:100%;min-height:44px;border:1px solid #d2cfc7;background:var(--fond);border-radius:7px;padding:9px 12px;font-size:14px;color:var(--texte);margin-top:5px}.outils-catalogue input[type=search]{font-size:16px;background:#fff}.filtres-catalogue{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:14px}.ligne-catalogue{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:17px}.ligne-catalogue p{font-size:13px;margin:0}.mode-affichage{display:flex;gap:13px;border:0;padding:0;margin:0}.mode-affichage label{display:flex;gap:5px;align-items:center;color:var(--nuit)}.mode-affichage input{accent-color:var(--nuit)}details.fiche{background:#fff;border:1px solid var(--ligne);border-radius:12px;margin:12px 0;overflow:hidden}details.fiche>summary{cursor:pointer;list-style:none;padding:18px;display:flex;align-items:center;gap:14px}details.fiche>summary::-webkit-details-marker{display:none}.fiche .num{border-color:#e8e2d8;align-self:flex-start}.fiche-intro{min-width:0;flex:1}.fiche-intro strong{display:block;font:700 15px/1.5 Montserrat,Arial,sans-serif;color:var(--nuit)}.fiche-intro small{display:block;color:var(--gris);font-size:12px;margin-top:5px}.fiche-intro .formats{font-size:11px;color:var(--peche-fonce);margin-top:8px;display:flex;gap:12px}.fiche-fleche{color:var(--peche-fonce);font-size:23px;transition:transform .15s}.fiche[open] .fiche-fleche{transform:rotate(90deg)}.fiche-detail{padding:0 18px 18px}.fiche-detail article.ens{border:0;box-shadow:none;padding:14px 0 0;margin:0;border-top:1px solid var(--ligne);border-radius:0}.fiche-detail article .num{display:none}.suivi-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.suivi-actions button{font-size:12px;font-weight:700;padding:7px 11px;min-height:36px;border-radius:6px;background:var(--fond);border:1px solid var(--ligne)}.suivi-actions button[aria-pressed=true]{background:#e9f0e5;border-color:#b4c8a7;color:#38542a}.fiche-marques{font-size:11px!important;color:#476437!important}.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}.sans-js{padding:20px;text-align:center;background:#fff1cf}#aucun-resultat{padding:24px 0}.catalogue>#effacer-filtres{font-size:12px;margin-top:10px}
@media(max-width:700px){.filtres-catalogue{grid-template-columns:repeat(2,minmax(0,1fr))}.hero{min-height:390px}.hero .in{padding:44px 20px 28px}.contenu{padding:18px 20px 40px}.invitation{padding:24px 20px}.entete-parcours{align-items:baseline;gap:10px}.entete-parcours>a{font-size:12px}.barre-acces{gap:10px;font-size:11px}.barre-acces>span{max-width:190px;line-height:1.4}.outils-catalogue{padding:15px}dialog{padding:29px 22px 22px}.saisie-code{flex-wrap:wrap}.saisie-code input{width:100%}.saisie-code button{flex:1}details.fiche>summary{padding:15px 12px;gap:10px}.fiche-intro strong{font-size:13px}.fiche-detail{padding:0 14px 16px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition:none!important}}
`;

const script = String.raw`
(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const normaliser = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const stocker = (cle, valeur) => { try { localStorage.setItem(cle, valeur); return true; } catch { return false; } };
  const lire = (cle, defaut) => { try { return localStorage.getItem(cle) || defaut; } catch { return defaut; } };
  let suivi; try { suivi = JSON.parse(lire('prepa-suivi-v1', '{}')); } catch { suivi = {}; }
  if (!suivi || typeof suivi !== 'object' || Array.isArray(suivi)) suivi = {};
  let ouvert = lire('prepa-acces-v1', '') === '3309';
  const dialogue = $('#dialogue-acces');
  let destination = null;
  function etatAcces() {
    $$('a[data-ressource]').forEach((a) => {
      a.setAttribute('href', ouvert ? a.dataset.ressource : '#acces');
      a.classList.toggle('reserve', !ouvert);
      if (ouvert) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); a.removeAttribute('aria-haspopup'); a.removeAttribute('title'); }
      else { a.removeAttribute('target'); a.setAttribute('aria-haspopup', 'dialog'); a.setAttribute('title', 'Ressource réservée aux inscrits'); }
    });
    $('[data-etat-acces]').textContent = ouvert ? 'Votre accès aux conférences et aux supports est ouvert sur cet appareil.' : 'Le code vous est communiqué lors de votre inscription.';
    $('[data-barre-etat]').textContent = ouvert ? 'Votre accès au parcours est ouvert' : 'Conférences et supports réservés aux inscrits';
    $$('.barre-acces [data-ouvrir-acces]').forEach((b) => b.hidden = ouvert);
    $('#verrouiller').hidden = !ouvert;
    $('.barre-acces').classList.toggle('ouvert', ouvert);
  }
  function ouvrirDialogue(url = null) {
    destination = url; $('#erreur-acces').textContent = ''; $('#code-acces').value = '';
    if (!dialogue.open) dialogue.showModal();
    $('#code-acces').focus();
  }
  document.addEventListener('click', (e) => {
    const bouton = e.target.closest('[data-ouvrir-acces]');
    if (bouton) { e.preventDefault(); ouvrirDialogue(); return; }
    const lien = e.target.closest('a[data-ressource]');
    if (lien && !ouvert) { e.preventDefault(); ouvrirDialogue(lien.dataset.ressource); }
  });
  $('#fermer-acces').addEventListener('click', () => dialogue.close());
  dialogue.addEventListener('click', (e) => { if (e.target === dialogue) { const r = dialogue.getBoundingClientRect(); if(e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialogue.close(); } });
  $('#formulaire-acces').addEventListener('submit', (e) => {
    e.preventDefault();
    if ($('#code-acces').value.trim() !== '3309') { $('#erreur-acces').textContent = 'Ce code ne correspond pas. Vérifiez les 4 chiffres reçus lors de votre inscription.'; $('#code-acces').select(); return; }
    ouvert = true;
    const memorise = stocker('prepa-acces-v1', '3309'); etatAcces(); dialogue.close();
    if (!memorise) $('[data-etat-acces]').textContent = 'Accès ouvert pour cette visite. Votre navigateur ne permet pas de mémoriser le code.';
    if (destination) { window.open(destination, '_blank', 'noopener'); destination = null; }
  });
  $('#verrouiller').addEventListener('click', () => { ouvert = false; stocker('prepa-acces-v1', ''); etatAcces(); });

  const originaux = $$('section.vue:not(#catalogue):not(#choix) article.ens');
  const catalogue = originaux.map((article, ordre) => {
    const txt = $('.txt', article).cloneNode(true); $$('.tag,.we', txt).forEach((el) => el.remove());
    const suite = [];
    for (let n = article.nextElementSibling; n && !n.matches('article.ens,h2,h3'); n = n.nextElementSibling) suite.push(n);
    const debut = txt.textContent.replace(/\s+/g, ' ').trim();
    const texte = [debut, ...suite.map((n) => n.textContent)].join(' ').replace(/\s+/g, ' ').trim();
    const titre = debut.split(/\s*\(/)[0].trim() || debut;
    const partie = article.closest('section.vue');
    const nomPartie = $('h2', partie)?.textContent || 'Pour commencer';
    const themes = $$('.tag', article).map((el) => el.textContent.trim());
    const formats = [...new Set($$('a', article).map((a) => {
      const url = a.dataset.ressource || a.href;
      return /youtu\.be|youtube\.com/.test(url) ? 'Vidéo' : /\.(pdf|docx?|zip|tif)(?:[?#]|$)/i.test(url) ? 'Document' : null;
    }).filter(Boolean))];
    return { article, suite, ordre, num: article.dataset.num, titre, texte, recherche: normaliser(texte), partie: partie.id, nomPartie, themes, formats };
  });
  const reperes = $$('section.vue:not(#catalogue):not(#choix)').map((vue) => {
    const contenu = vue.cloneNode(true);
    $$('article.ens,.legende,.invitation,.cartes,.entete-parcours,.hero,.suivi-actions', contenu).forEach((n) => n.remove());
    const texte = contenu.textContent.replace(/\s+/g, ' ').trim();
    return { id: vue.id, titre: $('h2', vue)?.textContent || 'Présentation du parcours', texte, recherche: normaliser(texte) };
  });
  function option(select, valeur, texte) { const o = document.createElement('option'); o.value = valeur; o.textContent = texte; select.appendChild(o); }
  const parties = new Map(catalogue.map((e) => [e.partie, e.nomPartie]));
  for (const [id, nom] of parties) option($('#filtre-partie'), id, nom);
  const themes = [...new Set(catalogue.flatMap((e) => e.themes))].sort((a,b) => a.localeCompare(b, 'fr'));
  themes.forEach((t) => option($('#filtre-theme'), t, t));
  function marquer() {
    $$('[data-suivi]').forEach((b) => { const coche = !!suivi[b.dataset.num]?.[b.dataset.suivi]; b.setAttribute('aria-pressed', String(coche)); b.textContent = (coche ? '✓ ' : '') + (b.dataset.suivi === 'aVoir' ? 'À voir' : 'Vu'); });
    $$('[data-marques]').forEach((el) => { const s = suivi[el.dataset.marques] || {}; el.textContent = [s.aVoir && 'À voir', s.vu && 'Vu'].filter(Boolean).join(' · '); });
  }
  function actions(num) {
    const div = document.createElement('div'); div.className = 'suivi-actions';
    for (const [cle, label] of [['aVoir','À voir'], ['vu','Vu']]) { const b = document.createElement('button'); b.type = 'button'; b.dataset.suivi = cle; b.dataset.num = num; b.setAttribute('aria-label', label + ' — enseignement ' + num); b.textContent = label; div.appendChild(b); }
    return div;
  }
  // Les mêmes repères sont disponibles dans les parties et dans les sélections du tableau.
  originaux.forEach((article) => $('.txt', article).appendChild(actions(article.dataset.num)));
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-suivi]'); if (!b) return;
    const s = suivi[b.dataset.num] || {}; s[b.dataset.suivi] = !s[b.dataset.suivi]; suivi[b.dataset.num] = s;
    if (!stocker('prepa-suivi-v1', JSON.stringify(suivi))) $('#note-locale').textContent = 'Votre navigateur ne permet pas d’enregistrer vos repères : ils resteront disponibles pendant cette visite uniquement.';
    marquer(); if ($('#filtre-suivi').value) remplirCatalogue();
  });
  function remplirCatalogue() {
    const termes = normaliser($('#recherche').value).split(/\s+/).filter(Boolean);
    let selection = catalogue.filter((e) => termes.every((t) => e.recherche.includes(t))
      && (!$('#filtre-partie').value || e.partie === $('#filtre-partie').value)
      && (!$('#filtre-theme').value || e.themes.includes($('#filtre-theme').value))
      && (!$('#filtre-suivi').value || ($('#filtre-suivi').value === 'nonVu' ? !suivi[e.num]?.vu : !!suivi[e.num]?.[$('#filtre-suivi').value])));
    if ($('#tri').value === 'alpha') selection.sort((a,b) => a.titre.localeCompare(b.titre, 'fr'));
    const liste = $('#catalogue-liste'); liste.replaceChildren();
    for (const e of selection) {
      const d = document.createElement('details'); d.className = 'fiche'; d.open = $('input[name=affichage]:checked').value === 'details';
      const summary = document.createElement('summary');
      summary.appendChild($('.num', e.article).cloneNode(true));
      const intro = document.createElement('span'); intro.className = 'fiche-intro';
      const titre = document.createElement('strong'); titre.textContent = e.titre; intro.appendChild(titre);
      const partie = document.createElement('small'); partie.textContent = e.nomPartie; intro.appendChild(partie);
      const formats = document.createElement('span'); formats.className = 'formats'; formats.textContent = e.formats.join(' · '); intro.appendChild(formats);
      const marques = document.createElement('small'); marques.className = 'fiche-marques'; marques.dataset.marques = e.num; intro.appendChild(marques);
      summary.appendChild(intro); const fleche = document.createElement('span'); fleche.className='fiche-fleche'; fleche.textContent='›'; fleche.setAttribute('aria-hidden','true'); summary.appendChild(fleche); d.appendChild(summary);
      const detail = document.createElement('div'); detail.className = 'fiche-detail'; detail.appendChild(e.article.cloneNode(true)); e.suite.forEach((n) => detail.appendChild(n.cloneNode(true))); d.appendChild(detail); liste.appendChild(d);
    }
    const pages = $('#resultats-reperes'); pages.replaceChildren();
    const autres = termes.length && !$('#filtre-suivi').value && !$('#filtre-theme').value ? reperes.filter((p) => termes.every((t) => p.recherche.includes(t)) && (!$('#filtre-partie').value || p.id === $('#filtre-partie').value) && !selection.some((e) => e.partie === p.id)) : [];
    if (autres.length) {
      const h = document.createElement('h3'); h.textContent = 'Autres passages du programme'; pages.appendChild(h);
      autres.forEach((p) => {
        const a = document.createElement('a'); a.className = 'carte'; a.href = '#' + p.id;
        const titre = document.createElement('strong'); titre.textContent = p.titre; a.appendChild(titre);
        const apercu = document.createElement('span'); const pos = p.recherche.indexOf(termes[0]); const debut = Math.max(0, pos - 65); apercu.textContent = (debut ? '… ' : '') + p.texte.slice(debut, debut + 180) + '…'; a.appendChild(apercu); pages.appendChild(a);
      });
    }
    $('#compte-resultats').textContent = selection.length + ' enseignement' + (selection.length > 1 ? 's' : '') + ' sur ' + catalogue.length + (autres.length ? ' · ' + autres.length + ' autre' + (autres.length > 1 ? 's passages' : ' passage') : '');
    $('#aucun-resultat').hidden = selection.length !== 0 || autres.length !== 0; etatAcces(); marquer();
    if (window.lucide) lucide.createIcons();
  }
  $('#recherche').addEventListener('input', remplirCatalogue);
  $$('#catalogue select, input[name=affichage]').forEach((el) => el.addEventListener('change', remplirCatalogue));
  $('#effacer-filtres').addEventListener('click', () => { $('#recherche').value = ''; $$('#catalogue select').forEach((s) => s.selectedIndex = 0); remplirCatalogue(); });
  window.addEventListener('hashchange', () => { if (location.hash === '#catalogue') remplirCatalogue(); else { etatAcces(); marquer(); } });
  remplirCatalogue();
})();
`;
