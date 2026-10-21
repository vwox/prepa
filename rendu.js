// Page web du parcours de préparation au mariage, tirée du Word (.docx) sans toucher au texte ni aux liens.
// Portage JavaScript de prepa_html.py (dépôt Zita, 21/10/2026), qui tourne dans GitHub Actions (construire.mjs).
// rendre(octetsDocx) → { html, nbLiens } ; aucune dépendance au navigateur ni à Node.
// Retours du 21/10/2026 (le Père, Amandine) : numéros aux couleurs des thèmes du tableau, conférenciers séparés et
// nommés, accroche en capitales, titres des ouvrages en italique sous les citations, adresse de l'abbaye tout en bas.
import { unzipSync, strFromU8 } from 'fflate';
import { DOMParser } from '@xmldom/xmldom';

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
// ses couleurs (sinon on prend celles du Word, ce qui suit ses changements)
const THEMES = [[/th[ée]olog/i, '#B8982A'], [/essentiel/i, '#2F3F92'], [/crise/i, '#3FA535'], [/sexualit/i, '#C76FAA'], [/argent|temps/i, '#009FE3']];
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

  const blocs = []; const sections = []; const contacts = [];
  let couverture = null; let logo = null; let sousTitre = ''; let titre = ''; let enContacts = false;
  const corps = premier(doc, W, 'body');

  // thèmes du tableau : une ligne colorée (dans le Word) ou nommée (« théologiques », « essentiel »…) donne sa couleur
  // à tous les numéros qu'elle cite ; un numéro cité par deux thèmes porte les deux couleurs
  const couleurRun = (n) => {
    const r = tous(n, W, 'r').find((x) => texte(x));
    const c = r && premier(r, W, 'color');
    return c ? attr(c, W, 'val').toUpperCase() : '';
  };
  const themeLigne = new Map(); const themesNum = {};
  for (const tbl of enfants(corps).filter((c) => local(c) === 'tbl')) {
    const lignes = enfants(tbl).filter((c) => local(c) === 'tr').slice(1);
    const cellules = lignes.map((tr) => enfants(tr).filter((c) => local(c) === 'tc'));
    const freq = {};
    for (const cs of cellules) if (cs[0]) { const c = couleurRun(cs[0]); freq[c] = (freq[c] || 0) + 1; }
    const neutre = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0];
    lignes.forEach((tr, i) => {
      const [c1, c2] = cellules[i];
      if (!c1 || !c2) return;
      const libelle = texte(c1); const c = couleurRun(c1);
      const kw = THEMES.find(([re]) => re.test(libelle));
      const couleur = c && c !== neutre && /^[0-9A-F]{6}$/.test(c) ? `#${c}` : kw ? kw[1] : '';
      if (!couleur) return;
      themeLigne.set(tr, couleur);
      for (const n of numerosCites(texte(c2))) (themesNum[n] ||= []).push({ couleur, libelle: libelle.replace(/\s*:\s*$/, '') });
    });
  }
  const pastille = (num) => {
    const th = themesNum[num] || [];
    if (!th.length) return '<div class="num">';
    const fond = th.length === 1 ? th[0].couleur : `linear-gradient(135deg,${th[0].couleur} 50%,${th[1].couleur} 50%)`;
    return `<div class="num theme" style="background:${fond}" title="${esc(th.map((x) => x.libelle).join(' · '))}">`;
  };

  for (const el of enfants(corps)) {
    const tag = local(el);
    if (tag === 'tbl') {
      const lignes = enfants(el).filter((c) => local(c) === 'tr').map((tr, i) => {
        const cell = i === 0 ? 'th' : 'td';
        const couleur = themeLigne.get(tr);
        return (couleur ? `<tr class="theme" style="--c:${couleur}">` : '<tr>') + enfants(tr).filter((c) => local(c) === 'tc').map((tc) =>
          `<${cell}>` + enfants(tc).filter((c) => local(c) === 'p' && texte(c)).map((p) => runsHtml(p)).join('<br>') + `</${cell}>`).join('') + '</tr>';
      });
      blocs.push('<div class="table"><table>' + lignes.join('') + '</table></div>');
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
      else blocs.push(`<figure class="photo"><img src="${dataUri(rid)}" alt=""></figure>`);
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
    if (!sections.length && /crmd/.test(t) && !/<a /.test(contenu)) {
      const noms = separerNoms(t);
      if (noms.length >= 6) {
        blocs.push(`<section class="intervenants"><h3>Les conférenciers</h3><ul>${noms.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></section>`);
        continue;
      }
    }
    // citation : « … » puis l'auteur (en gras) et l'ouvrage (italique du Word), sur une ligne à part
    if (t.startsWith('«') && t.lastIndexOf('»') > 0 && t.lastIndexOf('»') < t.length - 3) {
      const h = runsHtml(el, true); const k = h.lastIndexOf('»');
      const source = h.slice(k + 1).trim();
      const auteur = source.match(/^((?:Saint|Sainte|Pape|Bienheureux|Bx)\s+)?[A-ZÀ-Þ][\wà-ÿ’'-]+(\s+[IVXLC]+\b)?/);
      const legende = auteur ? `<strong>${auteur[0]}</strong>${source.slice(auteur[0].length).replace(/^\s*/, ' — ')}` : source;
      blocs.push(`<blockquote class="citation"><p>${h.slice(0, k + 1)}</p><cite>${legende}</cite></blockquote>`);
      continue;
    }
    const premierRun = enfants(el).find((c) => ['r', 'hyperlink'].includes(local(c)) && (tous(c, W, 't').some((x) => (x.textContent || '').trim()) || tous(c, W, 'drawing').length));
    if (premierRun && tous(premierRun, W, 'drawing').length && t.length < 140 && !LABEL.test(t)) { blocs.push(`<li class="chip">${contenu}</li>`); continue; }
    if (nom === 'heading 1') { const ancre = `s${sections.length}`; sections.push([ancre, t]); blocs.push(`<h2 id="${ancre}">${contenu}</h2>`); continue; }
    // le sous-titre d'accroche (avant la première partie) en capitales ; les autres avec au moins une majuscule
    if (nom === 'heading 2') { blocs.push(sections.length ? `<h3>${contenu}</h3>` : `<h3 class="accroche">${contenu}</h3>`); continue; }
    const m = t.match(LABEL);
    if (m) {
      const num = m[2] + (m[4] ? 'bis' : '');
      const etoile = m[1] ? '<span class="we" title="Conférence donnée lors des WE communs à Lagrasse">WE</span>' : '';
      const corpsHtml = contenu.replace(/^(\s*(<strong>)?\s*)\*?\s*\d+\s*(<[^>]+>)*\s*(er|e)\s*(<[^>]+>)*\s*(bis)?\s*(<[^>]+>)*\s*(enseignement|ens\.?)\s*:?/i, '$1');
      blocs.push(`<article class="ens">${pastille(num)}${num}</div><div class="txt">${etoile}${corpsHtml}</div></article>`);
      continue;
    }
    blocs.push(`<p>${contenu}</p>`);
  }

  const groupes = []; let ouvert = false;
  for (const b of blocs) {
    if (b.startsWith('<li class="chip">')) { if (!ouvert) { groupes.push('<ul class="chips">'); ouvert = true; } }
    else if (ouvert) { groupes.push('</ul>'); ouvert = false; }
    groupes.push(b);
  }
  if (ouvert) groupes.push('</ul>');
  const htmlCorps = groupes.join('\n').replace(/en gras italique/g, 'en gras');
  const sommaire = sections.map(([a, t]) => `<a href="#${a}">${esc(t)}</a>`).join('');
  return { nbLiens, html: page({ titre, sousTitre, couverture, logo, sommaire, htmlCorps, contacts }) };
}

function page({ titre, sousTitre, couverture, logo, sommaire, htmlCorps, contacts }) {
  const pied = contacts.length ? contacts.map((c) => `<p>${c}</p>`).join('')
    : 'Abbaye Sainte-Marie de Lagrasse · <a href="https://www.lagrasse.org" target="_blank" rel="noopener">www.lagrasse.org</a>';
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Parcours en ligne de préparation au mariage — Abbaye Sainte-Marie de Lagrasse</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&family=Lato:wght@400;700&display=swap" rel="stylesheet">
<script src="https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js"></script>
<style>
:root{--nuit:#232B5E;--peche:#F4A582;--peche-fonce:#D2643C;--texte:#2E2E2E;--gris:#6B6B6B;--fond:#FBF7F4;--carte:#FFFFFF;--ligne:#EADFD8}
*{box-sizing:border-box} html{scroll-behavior:smooth}
body{margin:0;background:var(--fond);color:var(--texte);font:16px/1.6 Lato,Arial,sans-serif}
a{color:var(--nuit);font-weight:700;text-decoration:none;border-bottom:1px solid var(--peche)} a:hover{background:#FDEBE2}
.hero{position:relative;min-height:62vh;display:flex;align-items:flex-end;color:#fff;background:var(--nuit) center/cover no-repeat}
.hero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(35,43,94,.15) 0%,rgba(35,43,94,.92) 75%)}
.hero .in{position:relative;z-index:1;max-width:860px;margin:0 auto;padding:48px 20px 36px;width:100%}
.hero h1{font:700 clamp(28px,6vw,48px)/1.1 Montserrat,Arial,sans-serif;margin:0 0 12px;letter-spacing:.5px}
.hero p{margin:0;font-size:18px;opacity:.95}
.chips{list-style:none;padding:0;margin:20px 0 28px;display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px}
.chip{background:#fff;border:1px solid var(--ligne);border-left:4px solid var(--peche);border-radius:12px;padding:12px 14px;font-size:15px}
.chip .ico{width:20px;height:20px;margin-right:6px}
.logo{width:64px;height:auto;border-radius:8px;margin-bottom:16px;background:#fff;padding:4px}
main{max-width:860px;margin:0 auto;padding:8px 20px 60px}
nav.som{position:sticky;top:0;z-index:5;background:rgba(251,247,244,.96);backdrop-filter:blur(6px);display:flex;gap:8px;overflow-x:auto;padding:12px 20px;border-bottom:1px solid var(--ligne)}
nav.som a{flex:0 0 auto;border:1px solid var(--nuit);border-radius:999px;padding:6px 14px;font:500 14px Montserrat,Arial,sans-serif}
h2{font:700 24px/1.25 Montserrat,Arial,sans-serif;color:var(--nuit);margin:48px 0 16px;padding-bottom:8px;border-bottom:3px solid var(--peche)}
h3{font:700 18px Montserrat,Arial,sans-serif;color:var(--nuit);margin:28px 0 10px}
p{margin:0 0 14px}
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
tr.theme td:first-child{border-left:5px solid var(--c)} tr.theme td{color:var(--c)} tr.theme td:last-child{color:var(--c)}
.txt{flex:1;min-width:0}
.we{display:inline-block;background:var(--peche);color:var(--nuit);font:700 11px Montserrat,Arial,sans-serif;border-radius:6px;padding:2px 6px;margin-right:6px;vertical-align:2px}
.ico{width:16px;height:16px;vertical-align:-3px;color:var(--peche-fonce);margin:0 2px;stroke-width:2}
.ico-img{width:16px;height:16px;vertical-align:-3px;margin:0 2px}
figure.photo{margin:28px 0;border-radius:16px;overflow:hidden} figure.photo img{display:block;width:100%;height:auto;max-height:340px;object-fit:cover}
.table{overflow-x:auto;margin:16px 0 24px;border-radius:12px;border:1px solid var(--ligne)}
table{border-collapse:collapse;width:100%;background:#fff;font-size:15px}
th{background:var(--nuit);color:#fff;text-align:left;font:700 14px Montserrat,Arial,sans-serif;padding:10px 12px}
td{padding:9px 12px;border-top:1px solid var(--ligne);vertical-align:top} td:last-child{font-weight:700;color:var(--nuit)}
footer{background:var(--nuit);color:#fff;padding:28px 20px;text-align:center;font-size:14px} footer a{color:#fff;border-color:var(--peche)} footer p{margin:0 0 6px}
@media (max-width:520px){article.ens{padding:14px 12px;gap:10px} .num{flex-basis:36px;height:36px;font-size:13px} h2{font-size:21px}}
</style></head><body>
<header class="hero" style="background-image:url('${couverture || ''}')"><div class="in">
${logo ? `<img class="logo" src="${logo}" alt="Abbaye Sainte-Marie de Lagrasse">` : ''}
<h1>${titre}</h1><p>${sousTitre}</p></div></header>
<nav class="som">${sommaire}</nav>
<main>
${htmlCorps}
</main>
<footer>${pied}</footer>
<script>lucide.createIcons();</script>
</body></html>`;
}
