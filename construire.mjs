// Refait la page du parcours depuis le Word du Père, dans le dossier site/ (21/10/2026).
// - GitHub Actions (toutes les 5 minutes) : node construire.mjs   → lit le doc dont l'identifiant est dans DOC_ID
// - sur l'ordinateur, pour essayer :       node construire.mjs essais/mon.docx
// Ne publie que si quelque chose a changé : on compare l'empreinte du doc et du code avec site/version.txt de la page
// en ligne (SITE_URL). Si le doc ne répond pas, on ne publie rien : la page en ligne garde sa dernière version.
import { readFileSync, writeFileSync, mkdirSync, appendFileSync } from 'fs';
import { createHash } from 'crypto';
import { rendre } from './rendu.js';

const sortie = (cle, val) => { if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${cle}=${val}\n`); };
const empreinte = (u8) => createHash('sha256').update(u8).digest('hex');

async function telecharger(id) {
  // Google Doc natif (export) ou fichier Word déposé sur le Drive (téléchargement direct)
  const essais = [`https://docs.google.com/document/d/${id}/export?format=docx`, `https://drive.google.com/uc?export=download&id=${id}`];
  for (const url of essais) {
    const r = await fetch(url, { redirect: 'follow' }).catch(() => null);
    if (!r || !r.ok) continue;
    const octets = new Uint8Array(await r.arrayBuffer());
    if (octets[0] === 0x50 && octets[1] === 0x4b) return octets; // « PK » : c'est bien un .docx
  }
  throw new Error("document illisible ou non partagé (Partager › Tous les utilisateurs qui ont le lien › Lecteur)");
}

let octets;
try {
  octets = process.argv[2] ? new Uint8Array(readFileSync(process.argv[2])) : await telecharger(process.env.DOC_ID);
} catch (e) {
  console.log(`::warning::Doc non lu, la page en ligne garde sa dernière version : ${e.message}`);
  sortie('change', 'false');
  process.exit(0);
}

const version = `${empreinte(octets)} ${empreinte(Buffer.concat(['rendu.js', 'interface.js'].map((f) => readFileSync(new URL('./' + f, import.meta.url)))))}\n`;
if (process.env.SITE_URL && !process.env.FORCER) {
  const enLigne = await fetch(`${process.env.SITE_URL.replace(/\/$/, '')}/version.txt`, { cache: 'no-store' })
    .then((r) => (r.ok ? r.text() : '')).catch(() => '');
  if (enLigne === version) { console.log('Rien de nouveau dans le doc.'); sortie('change', 'false'); process.exit(0); }
}

const { html, nbLiens } = await rendre(octets);
mkdirSync('site', { recursive: true });
writeFileSync('site/index.html', html);
writeFileSync('site/version.txt', version);
writeFileSync('site/robots.txt', 'User-agent: *\nDisallow: /\n');
console.log(`Page refaite : ${nbLiens} liens, ${html.length} octets.`);
sortie('change', 'true');
