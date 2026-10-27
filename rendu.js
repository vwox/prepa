// Page web du parcours de préparation au mariage, tirée du Word (.docx) sans toucher au texte ni aux liens.
// Portage JavaScript de prepa_html.py (dépôt Zita, 21/10/2026), qui tourne dans GitHub Actions (construire.mjs).
// rendre(octetsDocx) → { html, nbLiens } ; aucune dépendance au navigateur ni à Node.
// Retours du 21/10/2026 (le Père, Amandine) : numéros aux couleurs des thèmes du tableau, conférenciers séparés et
// nommés, accroche en capitales, titres des ouvrages en italique sous les citations, adresse de l'abbaye tout en bas.
// Retour d'Anne et Mechtilde (21/10) : accueil court, une vue par partie, thèmes nommés sur chaque enseignement.
import { unzipSync, strFromU8 } from 'fflate';
import { DOMParser } from '@xmldom/xmldom';
import { ameliorerPage } from './interface.js';

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const WP = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing';
const A = 'http://schemas.openxmlformats.org/drawingml/2006/main';
const EMU_CM = 360000;
const LABEL = /^\s*(\*?)\s*(\d+)\s*(er|e)\s*(bis)?\s*(enseignement|ens\.?)\s*:?\s*/i;
// pictos du Word, reconnus à leur empreinte SHA-1 (les noms de fichiers changent quand Word réenregistre)
const ICONES = {
  e712b20cf2594ebfa249b0cea07b8c6d222d72ea: 'video', '65b2eba816a9f28194fee53f2f8de0759cf971b0': 'file-text',
  '1e823985672e8d53fa5d8c80d795180d4dff6ab4': 'list-checks', ad34aee7b05b19375451b14299b49c08de3a02b4: 'cross',
  '7bd5dec95f97056974801e24614e4cb437f0bc33': 'library', '1ea98a03f1b0af555c372bdb046d6affeff26cc6': 'users',
  '9b0d69db77203505a6bce4e086f57beb25b1799f': 'volume-2',
};
// couleurs des thèmes du tableau « Si vous êtes pressés… », reprises du Word du Père ; servent quand le Word n'a plus
// ses couleurs (sinon on prend celles du Word, ce qui suit ses changements) ; le nom court s'affiche sur les enseignements
const THEMES = [[/th[ée]olog/i, '#B8982A', 'Théologique et spirituel'], [/essentiel/i, '#2F3F92', 'L’essentiel'],
  [/crise/i, '#3FA535', 'Crises'], [/sexualit/i, '#C76FAA', 'Sexualité'], [/argent|temps/i, '#009FE3', 'Temps et argent']];
const NUM_BIS = /(\d+)(\s*bis)?/g;

// numéros cités dans une case du tableau : « 12,16 à 19, 22 à 24 », « 37 et 37 bis »
function numerosCites(s) {
  const out = [];
  const sansPlages = s.replace(/(\d+)\s*à\s*(\d+)/g, (_, a, b) => {
    for (let i = +a; i <= +b; i++) out.push(String(i));
    return ' ';
  });
  for (const m of sansPlages.matchAll(NUM_BIS)) out.push(m[1] + (m[2] ? 'bis' : ''));
  return out;
}

// « Père Jean-Baptiste, crmd (coordination) Père Michel, crmd … Marc et Maryvonne PIERRE Xavier et … » : un nom
// finit sur un NOM en capitales ou sur « crmd » / une parenthèse, le suivant commence par un prénom
function separerNoms(t) {
  const noms = []; let cur = [];
  const finDeNom = (m) => /^[^a-zà-öø-ÿ]*[A-ZÀ-ÖØ-Þ]{2,}[^a-zà-öø-ÿ]*$/.test(m.replace(/^[dl][’']/, '')) || m === 'crmd' || m.endsWith(')');
  for (const mot of t.split(/\s+/).filter(Boolean)) {
    if (cur.length && finDeNom(cur[cur.length - 1]) && /^[A-ZÀ-ÖØ-Þ][a-zà-öø-ÿ]/.test(mot)) { noms.push(cur.join(' ')); cur = []; }
    cur.push(mot);
  }
  if (cur.length) noms.push(cur.join(' '));
  return noms;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
const local = (n) => n.localName || n.nodeName.replace(/^.*:/, '');
const enfants = (n) => Array.from(n.childNodes || []).filter((c) => c.nodeType === 1);
const tous = (n, ns, tag) => Array.from(n.getElementsByTagNameNS(ns, tag));
const premier = (n, ns, tag) => tous(n, ns, tag)[0] || null;
const attr = (n, ns, nom) => (n ? n.getAttributeNS(ns, nom) || n.getAttribute(`w:${nom}`) || '' : '');

function b64(u8) {
  let s = '';
  for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return btoa(s);
}

async function sha1(u8) {
  const h = await crypto.subtle.digest('SHA-1', u8);
  return Array.from(new Uint8Array(h)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function rendre(octets) {
  const z = unzipSync(new Uint8Array(octets));
  const xml = (chemin) => new DOMParser().parseFromString(strFromU8(z[chemin]), 'text/xml');
  const doc = xml('word/document.xml');
  const rels = {};
  for (const r of Array.from(xml('word/_rels/document.xml.rels').getElementsByTagName('Relationship'))) rels[r.getAttribute('Id')] = r.getAttribute('Target');
  const noms = {};
  for (const s of tous(xml('word/styles.xml'), W, 'style')) {
    const n = premier(s, W, 'name');
    noms[attr(s, W, 'styleId')] = n ? attr(n, W, 'val') : '';
  }
  const media = {};
  for (const [rid, cible] of Object.entries(rels)) {
    const octetsImg = z['word/' + cible];
    if (!octetsImg || !/media\//.test(cible)) continue;
    media[rid] = { octets: octetsImg, mime: cible.endsWith('.png') ? 'image/png' : 'image/jpeg', icone: ICONES[await sha1(octetsImg)] };
  }
  const dataUri = (rid) => `data:${media[rid].mime};base64,${b64(media[rid].octets)}`;
  let nbLiens = 0;

  const texte = (p) => tous(p, W, 't').map((t) => t.textContent || '').join('').trim();
  const largeurCm = (dessin) => { const e = premier(dessin, WP, 'extent'); return e ? parseInt(e.getAttribute('cx'), 10) / EMU_CM : 0; };

  // italique : seulement là où on le demande (sources des citations) ; ailleurs le Word en met partout sur les liens
  function runHtml(r, italique = false) {
    const parts = [];
    for (const c of enfants(r)) {
      const tag = local(c);
      if (tag === 't') parts.push(esc(c.textContent || ''));
      else if (tag === 'br') parts.push('<br>');
      else if (tag === 'drawing') {
        const b = premier(c, A, 'blip');
        if (!b || largeurCm(c) >= 2) continue;
        const rid = b.getAttributeNS(R, 'embed') || b.getAttribute('r:embed');
        const m = media[rid];
        if (!m) continue;
        parts.push(m.icone ? `<i data-lucide="${m.icone}" class="ico"></i>` : `<img class="ico-img" src="${dataUri(rid)}" alt="">`);
      }
    }
    const s = parts.join('');
    const rpr = enfants(r).find((c) => local(c) === 'rPr');
    const b = rpr && enfants(rpr).find((c) => local(c) === 'b');
    const gras = b && !['0', 'false'].includes(attr(b, W, 'val'));
    const i = italique && rpr && enfants(rpr).find((c) => local(c) === 'i');
    const ital = i && !['0', 'false'].includes(attr(i, W, 'val'));
    const s2 = ital && s.trim() ? `<em>${s}</em>` : s;
    return gras && s.trim() ? `<strong>${s2}</strong>` : s2;
  }

  function runsHtml(p, italique = false) {
    const out = [];
    for (const el of enfants(p)) {
      const tag = local(el);
      if (tag === 'r') out.push(runHtml(el, italique));
      else if (tag === 'hyperlink') {
        const cible = rels[el.getAttributeNS(R, 'id') || el.getAttribute('r:id')] || '';
        const inner = tous(el, W, 'r').map((r) => runHtml(r, italique)).join('');
        if (cible && cible !== 'about:blank') { nbLiens += 1; out.push(`<a href="${esc(cible)}" target="_blank" rel="noopener">${inner}</a>`); }
        else out.push(inner);
      }
    }
    return out.join('');
  }

  // La page est découpée en « vues » (une seule visible à la fois, choisie dans le menu) : un accueil court, puis
  // les enseignements par partie (retour d'Anne et Mechtilde, 21/10/2026). Avant la première partie du Word :
  // - accueil : chiffres clés, accroche, inscription ;
  // - à savoir : conférenciers, citations, avantages, conseils, règles, règlement ;
  // - pour commencer : du 1er enseignement jusqu'au tableau ;
  // - par où commencer : le tableau « Si vous êtes pressés… » (chaque ligne ouvre la liste de ses enseignements).
  const blocs = []; const sections = []; const contacts = []; const filtres = [];
  let couverture = null; let logo = null; let sousTitre = ''; let titre = ''; let enContacts = false;
  let vuePre = 'accueil'; let vue = 'accueil';
  const ajouter = (html, v = vue) => blocs.push({ vue: v, html });
  const corps = premier(doc, W, 'body');

  // thèmes du tableau : une ligne colorée (dans le Word) ou nommée (« théologiques », « essentiel »…) donne sa couleur
  // à tous les numéros qu'elle cite ; un numéro cité par deux thèmes porte les deux couleurs
  const couleurRun = (n) => {
    const r = tous(n, W, 'r').find((x) => texte(x));
    const c = r && premier(r, W, 'color');
    return c ? attr(c, W, 'val').toUpperCase() : '';
  };
  const infoLigne = new Map(); const themesNum = {}; const themes = [];
  for (const tbl of enfants(corps).filter((c) => local(c) === 'tbl')) {
    const lignes = enfants(tbl).filter((c) => local(c) === 'tr').slice(1);
    const cellules = lignes.map((tr) => enfants(tr).filter((c) => local(c) === 'tc'));
    const freq = {};
    for (const cs of cellules) if (cs[0]) { const c = couleurRun(cs[0]); freq[c] = (freq[c] || 0) + 1; }
    const neutre = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
    lignes.forEach((tr, i) => {
      const [c1, c2] = cellules[i];
      if (!c1 || !c2) return;
      const libelle = texte(c1).replace(/\s*:\s*$/, ''); const c = couleurRun(c1);
      const nums = numerosCites(texte(c2));
      const kw = THEMES.find(([re]) => re.test(libelle));
      const couleur = c && c !== neutre && /^[0-9A-F]{6}$/.test(c) ? `#${c}` : kw ? kw[1] : '';
      const filtre = filtres.length;
      filtres.push({ titre: libelle, couleur, nums });
      infoLigne.set(tr, { couleur, filtre });
      if (!couleur) return;
      const court = kw ? kw[2] : libelle.replace(/^Vous (voulez|cherchez)\s+/i, '').slice(0, 32);
      themes.push({ couleur, court, filtre });
      for (const n of nums) (themesNum[n] ||= []).push({ couleur, court });
    });
  }
  const pastille = (num) => {
    const th = themesNum[num] || [];
    if (!th.length) return '<div class="num">';
    const fond = th.length === 1 ? th[0].couleur : `linear-gradient(135deg,${th[0].couleur} 50%,${th[1].couleur} 50%)`;
    return `<div class="num theme" style="background:${fond}">`;
  };
  const etiquettes = (num) => (themesNum[num] || []).map((x) => `<span class="tag" style="--c:${x.couleur}">${esc(x.court)}</span>`).join('');

  for (const el of enfants(corps)) {
    const tag = local(el);
    if (tag === 'tbl') {
      if (!sections.length) {
        // le paragraphe qui introduit le tableau part avec lui
        const prec = blocs[blocs.length - 1];
        if (prec && prec.vue === 'commencer' && prec.html.startsWith('<p>')) prec.vue = 'par-ou-commencer';
        vuePre = vue = 'par-ou-commencer';
      }
      const lignes = enfants(el).filter((c) => local(c) === 'tr').map((tr, i) => {
        const cell = i === 0 ? 'th' : 'td';
        const info = infoLigne.get(tr);
        const attrs = info ? ` data-filtre="${info.filtre}"${info.couleur ? ` class="theme" style="--c:${info.couleur}"` : ''}` : '';
        return `<tr${attrs}>` + enfants(tr).filter((c) => local(c) === 'tc').map((tc) =>
          `<${cell}>` + enfants(tc).filter((c) => local(c) === 'p' && texte(c)).map((p) => runsHtml(p)).join('<br>') + `</${cell}>`).join('') + '</tr>';
      });
      ajouter('<p class="aide">Touchez une ligne pour afficher ses enseignements.</p><div class="table"><table>' + lignes.join('') + '</table></div>');
      continue;
    }
    if (tag !== 'p') continue;
    const ppr = enfants(el).find((c) => local(c) === 'pPr');
    const ps = ppr && enfants(ppr).find((c) => local(c) === 'pStyle');
    const nom = ps ? noms[attr(ps, W, 'val')] || '' : '';
    const t = texte(el);
    const grandes = tous(el, WP, 'inline').filter((d) => largeurCm(d) >= 2);
    if (grandes.length && !t) {
      const b = premier(grandes[0], A, 'blip');
      const rid = b && (b.getAttributeNS(R, 'embed') || b.getAttribute('r:embed'));
      if (!rid || !media[rid]) continue;
      if (couverture === null) couverture = dataUri(rid);
      else if (largeurCm(grandes[0]) < 5) logo = dataUri(rid);
      else ajouter(`<figure class="photo"><img src="${dataUri(rid)}" alt=""></figure>`);
      continue;
    }
    if (!t) continue;
    const contenu = runsHtml(el);
    if (nom === 'Title') { titre = contenu; continue; }
    if (t.startsWith('par les chanoines') && !sousTitre) { sousTitre = contenu; continue; }
    // adresse et contacts de l'abbaye (et les adresses mail qui suivent) : tout en bas, dans le pied de page
    if (/^Abbaye Sainte[- ]Marie\b/.test(t) && /\d{5}/.test(t)) { enContacts = true; contacts.push(contenu); continue; }
    if (enContacts && /^\S+@\S+$|^(https?:\/\/|www\.)\S+$/.test(t)) { contacts.push(contenu); continue; }
    enContacts = false;
    if (nom === 'heading 1') {
      // « Socle de base de la préparation (suite) » rejoint la vue « Socle de base de la préparation »
      const base = t.replace(/\s*\(suite\)\s*$/i, '');
      const deja = sections.find((s) => s.titre === base);
      if (deja) { vue = deja.id; continue; }
      vue = `partie-${sections.length + 1}`;
      sections.push({ id: vue, titre: base });
      continue;
    }
    if (!sections.length) {
      if (/^(Quatre|Trois|Cinq|Six|Sept|Deux|\d+)\s+(avantages|conseils|règles)\b/i.test(t)) vuePre = 'a-savoir';
      else if (LABEL.test(t) && vuePre !== 'par-ou-commencer') vuePre = 'commencer';
      vue = vuePre;
    }
    if (!sections.length && /crmd/.test(t) && !/<a /.test(contenu)) {
      const noms = separerNoms(t);
      if (noms.length >= 6) {
        ajouter(`<section class="intervenants"><h3>Les conférenciers</h3><ul>${noms.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></section>`, 'a-savoir');
        continue;
      }
    }
    if (!sections.length && /^Réalisation des vidéos/.test(t)) { ajouter(`<p>${contenu}</p>`, 'a-savoir'); continue; }
    // citation : « … » puis l'auteur (en gras) et l'ouvrage (italique du Word), sur une ligne à part
    if (t.startsWith('«') && t.lastIndexOf('»') > 0 && t.lastIndexOf('»') < t.length - 3) {
      const h = runsHtml(el, true); const k = h.lastIndexOf('»');
      const source = h.slice(k + 1).trim();
      const auteur = source.match(/^((?:Saint|Sainte|Pape|Bienheureux|Bx)\s+)?[A-ZÀ-Þ][\wà-ÿ’'-]+(\s+[IVXLC]+\b)?/);
      const legende = auteur ? `<strong>${auteur[0]}</strong>${source.slice(auteur[0].length).replace(/^\s*/, ' — ')}` : source;
      ajouter(`<blockquote class="citation"><p>${h.slice(0, k + 1)}</p><cite>${legende}</cite></blockquote>`, sections.length ? vue : 'a-savoir');
      continue;
    }
    const premierRun = enfants(el).find((c) => ['r', 'hyperlink'].includes(local(c)) && (tous(c, W, 't').some((x) => (x.textContent || '').trim()) || tous(c, W, 'drawing').length));
    if (premierRun && tous(premierRun, W, 'drawing').length && t.length < 140 && !LABEL.test(t)) { ajouter(`<li class="chip">${contenu}</li>`); continue; }
    // le sous-titre d'accroche (avant la première partie) en capitales ; les autres avec au moins une majuscule
    if (nom === 'heading 2') { ajouter(sections.length ? `<h3>${contenu}</h3>` : `<h3 class="accroche">${contenu}</h3>`); continue; }
    const m = t.match(LABEL);
    if (m) {
      const num = m[2] + (m[4] ? 'bis' : '');
      const etoile = m[1] ? '<span class="we" title="Conférence donnée lors des WE communs à Lagrasse">WE</span>' : '';
      const corpsHtml = contenu.replace(/^((?:\s*<[^>]+>)*\s*)\*?(?:\s*<[^>]+>)*\s*\d+\s*(<[^>]+>)*\s*(er|e)\s*(<[^>]+>)*\s*(bis)?\s*(<[^>]+>)*\s*(enseignement|ens\.?)\s*:?/i, '$1')
        .replace(/<a [^>]*>(<strong><\/strong>)?<\/a>/g, '');  // morceaux de lien qui ne portaient que « 29e ens. »
      ajouter(`<article class="ens" data-num="${num}">${pastille(num)}${num}</div><div class="txt">${etoile}${etiquettes(num)}${corpsHtml}</div></article>`);
      continue;
    }
    ajouter(`<p>${contenu}</p>`);
  }

  // vues dans l'ordre du menu ; une vue vide (doc réorganisé) disparaît d'elle-même
  const vues = [
    { id: 'accueil', titre: 'Accueil' },
    { id: 'par-ou-commencer', titre: 'Par où commencer ?' },
    { id: 'commencer', titre: 'Pour commencer' },
    ...sections,
    { id: 'a-savoir', titre: 'À savoir' },
  ].map((v) => ({ ...v, blocs: blocs.filter((b) => b.vue === v.id).map((b) => b.html) }))
    .filter((v) => v.id === 'accueil' || v.blocs.length);
  for (const v of vues) {
    v.nbEns = v.blocs.filter((b) => b.startsWith('<article class="ens"')).length;
    const groupes = []; let ouvert = false;
    for (const b of v.blocs) {
      if (b.startsWith('<li class="chip">')) { if (!ouvert) { groupes.push('<ul class="chips">'); ouvert = true; } }
      else if (ouvert) { groupes.push('</ul>'); ouvert = false; }
      groupes.push(b);
    }
    if (ouvert) groupes.push('</ul>');
    v.html = groupes.join('\n').replace(/en gras italique/g, 'en gras');
  }
  const legende = themes.length ? `<div class="legende"><span>Thèmes :</span>${themes.map((th) =>
    `<a class="tag" style="--c:${th.couleur}" href="#choix-${th.filtre}">${esc(th.court)}</a>`).join('')}</div>` : '';
  return { nbLiens, html: ameliorerPage(page({ titre, sousTitre, couverture, logo, vues, legende, filtres, contacts })) };
}

function page({ titre, sousTitre, couverture, logo, vues, legende, filtres, contacts }) {
  const pied = contacts.length ? contacts.map((c) => `<p>${c}</p>`).join('')
    : 'Abbaye Sainte-Marie de Lagrasse · <a href="https://www.lagrasse.org" target="_blank" rel="noopener">www.lagrasse.org</a>';
  const menu = vues.map((v) => `<a href="#${v.id}">${esc(v.titre)}</a>`).join('');
  const cartes = vues.filter((v) => v.id !== 'accueil').map((v) => `<a class="carte" href="#${v.id}"><strong>${esc(v.titre)}</strong>`
    + `<span>${v.id === 'par-ou-commencer' ? 'Selon votre situation et vos envies' : v.id === 'a-savoir' ? 'Conférenciers, conseils, règles' : `${v.nbEns} enseignement${v.nbEns > 1 ? 's' : ''}`}</span></a>`).join('');
  const sections = vues.map((v) => {
    if (v.id === 'accueil') {
      return `<section class="vue" id="accueil"><header class="hero" style="background-image:url('${couverture || ''}')"><div class="in">
${logo ? `<img class="logo" src="${logo}" alt="Abbaye Sainte-Marie de Lagrasse">` : ''}
<h1>${titre}</h1><p>${sousTitre}</p></div></header><div class="contenu">
${v.html}
<h2>Le parcours</h2><nav class="cartes">${cartes}</nav>
${legende}</div></section>`;
    }
    const avecLegende = v.id.startsWith('partie-') || v.id === 'commencer';
    return `<section class="vue" id="${v.id}"><div class="contenu"><h2>${esc(v.titre)}</h2>${avecLegende ? legende : ''}
${v.html}</div></section>`;
  }).join('\n');
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Parcours en ligne de préparation au mariage — Abbaye Sainte-Marie de Lagrasse</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&family=Lato:wght@400;700&display=swap" rel="stylesheet">
<script src="https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js"></script>
<style>
:root{--nuit:#232B5E;--peche:#F4A582;--peche-fonce:#D2643C;--texte:#2E2E2E;--gris:#6B6B6B;--fond:#FBF7F4;--carte:#FFFFFF;--ligne:#EADFD8}
*{box-sizing:border-box}
body{margin:0;background:var(--fond);color:var(--texte);font:16px/1.6 Lato,Arial,sans-serif}
a{color:var(--nuit);font-weight:700;text-decoration:none;border-bottom:1px solid var(--peche)} a:hover{background:#FDEBE2}
.hero{position:relative;min-height:46vh;display:flex;align-items:flex-end;color:#fff;background:var(--nuit) center/cover no-repeat}
.hero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(35,43,94,.15) 0%,rgba(35,43,94,.92) 75%)}
.hero .in{position:relative;z-index:1;max-width:860px;margin:0 auto;padding:48px 20px 32px;width:100%}
.hero h1{font:700 clamp(28px,6vw,48px)/1.1 Montserrat,Arial,sans-serif;margin:0 0 12px;letter-spacing:.5px}
.hero p{margin:0;font-size:18px;opacity:.95}
.chips{list-style:none;padding:0;margin:20px 0 28px;display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px}
.chip{background:#fff;border:1px solid var(--ligne);border-left:4px solid var(--peche);border-radius:12px;padding:12px 14px;font-size:15px}
.chip .ico{width:20px;height:20px;margin-right:6px}
.logo{width:64px;height:auto;border-radius:8px;margin-bottom:16px;background:#fff;padding:4px}
.contenu{max-width:860px;margin:0 auto;padding:8px 20px 48px}
nav.menu{position:sticky;top:0;z-index:5;background:rgba(251,247,244,.97);backdrop-filter:blur(6px);display:flex;gap:8px;overflow-x:auto;padding:12px 20px;border-bottom:1px solid var(--ligne)}
nav.menu a{flex:0 0 auto;border:1px solid var(--nuit);border-radius:999px;padding:6px 14px;font:500 14px Montserrat,Arial,sans-serif}
nav.menu a.actif{background:var(--nuit);color:#fff}
h2{font:700 24px/1.25 Montserrat,Arial,sans-serif;color:var(--nuit);margin:36px 0 16px;padding-bottom:8px;border-bottom:3px solid var(--peche)}
h3{font:700 18px Montserrat,Arial,sans-serif;color:var(--nuit);margin:28px 0 10px}
p{margin:0 0 14px}
.cartes{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;margin:0 0 20px}
.carte{display:block;background:#fff;border:1px solid var(--ligne);border-radius:14px;padding:14px 16px;border-bottom:1px solid var(--ligne);box-shadow:0 1px 2px rgba(35,43,94,.05)}
.carte strong{display:block;font:700 16px/1.3 Montserrat,Arial,sans-serif;color:var(--nuit)} .carte span{font:400 14px Lato,Arial,sans-serif;color:var(--gris)}
.carte:hover{background:#fff;border-color:var(--peche)}
.legende{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:8px 0 20px;font-size:14px;color:var(--gris)}
.tag{display:inline-block;border:0;background:var(--c);color:#fff;font:700 11px/1.5 Montserrat,Arial,sans-serif;border-radius:6px;padding:2px 7px;margin-right:6px;vertical-align:2px}
a.tag{font-size:12.5px;padding:4px 10px;border-radius:999px;margin:0} a.tag:hover{background:var(--c);opacity:.85}
article.ens{display:flex;gap:14px;background:var(--carte);border:1px solid var(--ligne);border-radius:14px;padding:16px;margin:0 0 12px;box-shadow:0 1px 2px rgba(35,43,94,.05)}
.num{flex:0 0 44px;height:44px;border-radius:50%;background:#fff;border:2px solid var(--ligne);color:var(--nuit);display:flex;align-items:center;justify-content:center;font:700 15px Montserrat,Arial,sans-serif}
.num.theme{border:0;color:#fff;text-shadow:0 1px 1px rgba(0,0,0,.25)}
h3.accroche{text-transform:uppercase;letter-spacing:.06em;font-size:17px;line-height:1.4} h3::first-letter{text-transform:uppercase}
.intervenants{background:#fff;border:1px solid var(--ligne);border-radius:14px;padding:16px 18px;margin:20px 0}
.intervenants h3{margin:0 0 10px;font-size:15px;text-transform:uppercase;letter-spacing:.06em;color:var(--peche-fonce)}
.intervenants ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:4px 18px;font-size:15px}
.intervenants li{padding:3px 0;border-bottom:1px solid #F3ECE7}
blockquote.citation{margin:0 0 16px;padding:14px 18px;background:#fff;border-left:4px solid var(--peche);border-radius:0 12px 12px 0}
blockquote.citation p{margin:0 0 8px;font-size:15.5px}
blockquote.citation cite{display:block;font-style:normal;font-size:14px;color:var(--gris)} blockquote.citation cite strong{color:var(--nuit)} blockquote.citation em{font-style:italic}
.txt{flex:1;min-width:0}
.we{display:inline-block;background:var(--peche);color:var(--nuit);font:700 11px Montserrat,Arial,sans-serif;border-radius:6px;padding:2px 6px;margin-right:6px;vertical-align:2px}
.ico{width:16px;height:16px;vertical-align:-3px;color:var(--peche-fonce);margin:0 2px;stroke-width:2}
.ico-img{width:16px;height:16px;vertical-align:-3px;margin:0 2px}
figure.photo{margin:28px 0;border-radius:16px;overflow:hidden} figure.photo img{display:block;width:100%;height:auto;max-height:340px;object-fit:cover}
.aide{font-size:14px;color:var(--gris);margin:0 0 6px}
.table{overflow-x:auto;margin:6px 0 24px;border-radius:12px;border:1px solid var(--ligne)}
table{border-collapse:collapse;width:100%;background:#fff;font-size:15px}
th{background:var(--nuit);color:#fff;text-align:left;font:700 14px Montserrat,Arial,sans-serif;padding:10px 12px}
td{padding:9px 12px;border-top:1px solid var(--ligne);vertical-align:top} td:last-child{font-weight:700;color:var(--nuit)}
tr[data-filtre]{cursor:pointer} tr[data-filtre]:hover td{background:#FDF3EE} tr[data-filtre] td:last-child::after{content:" ›";color:var(--peche-fonce)}
tr.theme td:first-child{border-left:5px solid var(--c)} tr.theme td,tr.theme td:last-child{color:var(--c)}
.retour{display:inline-block;margin:18px 0 0;font-size:14px}
footer{background:var(--nuit);color:#fff;padding:28px 20px;text-align:center;font-size:14px} footer a{color:#fff;border-color:var(--peche)} footer p{margin:0 0 6px}
html.js .vue[hidden]{display:none}
@media (max-width:520px){article.ens{padding:14px 12px;gap:10px} .num{flex-basis:36px;height:36px;font-size:13px} h2{font-size:21px}}
</style></head><body>
<nav class="menu">${menu}</nav>
${sections}
<section class="vue" id="choix" hidden><div class="contenu"><h2 id="choix-titre"></h2><div id="choix-liste"></div>
<a class="retour" href="#par-ou-commencer">‹ Par où commencer ?</a></div></section>
<footer>${pied}</footer>
<script type="application/json" id="filtres">${JSON.stringify(filtres).replace(/</g, '\\u003c')}</script>
<script>
// une vue à la fois : #accueil, #par-ou-commencer, #partie-1… ; #choix-N affiche les enseignements de la ligne N du tableau
document.documentElement.classList.add('js');
const FILTRES = JSON.parse(document.getElementById('filtres').textContent);
const VUES = [...document.querySelectorAll('section.vue')];
function afficher() {
  const h = decodeURIComponent(location.hash.slice(1)) || 'accueil';
  let vue = document.getElementById(h);
  const m = h.match(/^choix-(\\d+)$/);
  if (m && FILTRES[+m[1]]) {
    const f = FILTRES[+m[1]];
    const titre = document.getElementById('choix-titre');
    titre.textContent = f.titre; titre.style.borderColor = f.couleur || '';
    const liste = document.getElementById('choix-liste'); liste.innerHTML = '';
    for (const n of f.nums) {
      const a = document.querySelector('section.vue:not(#choix) article.ens[data-num="' + n + '"]');
      if (a) liste.appendChild(a.cloneNode(true));
    }
    vue = document.getElementById('choix');
  }
  if (!vue || !vue.classList.contains('vue')) vue = document.getElementById('accueil');
  for (const v of VUES) v.hidden = v !== vue;
  for (const a of document.querySelectorAll('nav.menu a')) a.classList.toggle('actif', a.getAttribute('href') === '#' + vue.id);
  const actif = document.querySelector('nav.menu a.actif'); if (actif) actif.scrollIntoView({ block: 'nearest', inline: 'center' });
  window.scrollTo(0, 0);
}
for (const tr of document.querySelectorAll('tr[data-filtre]')) tr.addEventListener('click', (e) => { if (!e.target.closest('a')) location.hash = 'choix-' + tr.dataset.filtre; });
window.addEventListener('hashchange', afficher);
afficher();
lucide.createIcons();
</script>
</body></html>`;
}
