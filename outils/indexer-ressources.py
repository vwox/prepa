#!/usr/bin/env python3
"""Produce a lexical site index from a checked local corpus, without its text or URLs.

The separate URL map must stay outside Git (RESSOURCES_URLS Actions secret).
No downloads, AI, or changes to the originals are performed here.
"""
import argparse
import hashlib
import json
import re
import unicodedata
from pathlib import Path
from urllib.parse import urldefrag, urlparse


def normaliser(value):
    value = str(value).lower().replace('œ', 'oe').replace('æ', 'ae')
    return ''.join(c for c in unicodedata.normalize('NFD', value)
                   if not unicodedata.combining(c))


def lexique(text):
    # Keep no ordered sentences, URL, email, or telephone number in the public repo.
    text = re.sub(r'https?://\S+|\S+@\S+', ' ', text)
    return set(re.findall(r'[a-z]{2,}|\b(?:1[0-9]{3}|20[0-9]{2})\b', normaliser(text)))


def nettoyer_texte(text):
    # Prefaces created by the conversion are not content from the resource.
    return re.sub(r'^(?:Source\s*:|Version de lecture|Copie contrôlée|Note de lecture\s*:|Image conservée dans son format original|## Page [0-9]+).*$', '', text, flags=re.M)


def lire_texte(base, row):
    ident = row['id']
    path = base / row.get('texte', f'textes/{ident}.md')
    blocks = []
    if path.exists():
        raw = path.read_text()
        # Skip the generated provenance/reader preface, preserving source page text.
        blocks.append(nettoyer_texte(raw))
    for directory in ['ocr', 'ocr-recherche']:
        path = base / directory / f'{ident}.json'
        if path.exists():
            item = json.loads(path.read_text())
            blocks.append(item.get('article_relu_visuellement', {}).get('texte', ''))
            blocks.extend(p.get('texte', '') for p in item.get('pages', []))
    path = base / 'pages' / f'{ident}.json'
    if path.exists():
        # Some facsimile pages retain extraction in texte_extraction_initiale only.
        for page in json.loads(path.read_text()).get('pages', []):
            blocks.extend(nettoyer_texte(page.get(field, ''))
                          for field in ['texte_recherche', 'texte_extraction_initiale', 'texte'])
    return '\n'.join(blocks)


def build(base, existing):
    manifests = ['manifest.json', 'annexe-zip/manifest.json',
                 'annexe-drive/manifest.json', 'annexe-drive-civil/manifest.json']
    records = []
    for name in manifests:
        data = json.loads((base / name).read_text())
        for row in data['ressources']:
            records.append((name, row))
    catalog = {r['id']: r for r in json.loads((base / 'catalogue.json').read_text())}
    urls = {}
    by_sha = {}
    omitted = []
    teaching_words = {n: set() for n in existing}
    report_rows = []
    for manifest_name, row in records:
        ident = row['id']
        original = base / row['original'] if row.get('original') else None
        if not original or not original.exists() or not row.get('format_verifie'):
            omitted.append({'id': ident, 'motif': 'source non récupérée ou format invalide'})
            continue
        sha = hashlib.sha256(original.read_bytes()).hexdigest()
        if sha != row['sha256']:
            raise ValueError(f'Original modifié depuis le contrôle : {ident}')
        title = catalog[ident]['titre']
        body = lire_texte(base, row)
        words = lexique(title + '\n' + body)
        nums = row.get('enseignements', [])
        for num in nums:
            teaching_words.setdefault(num, set()).update(words)
        url = urldefrag(row['url'])[0]
        if urlparse(url).scheme not in ('http', 'https'):
            raise ValueError(f'URL non HTTP : {ident}')
        key = hashlib.sha256(url.encode()).hexdigest()[:20]
        urls[key] = url
        source_kind = ('zip' if manifest_name.startswith('annexe-zip') else
                       'drive' if manifest_name.startswith('annexe-drive') else 'direct')
        group = ('Tests de tempérament' if source_kind == 'zip' else
                 'Mariage avec un non-baptisé' if manifest_name == 'annexe-drive/manifest.json' else
                 'Préséance du mariage civil' if manifest_name == 'annexe-drive-civil/manifest.json' else '')
        if sha in by_sha:
            doc = by_sha[sha]
            doc['_words'].update(words)
            doc['enseignements'] = list(dict.fromkeys(doc['enseignements'] + nums))
            doc['ids'].append(ident)
        else:
            doc = {'id': ident, 'ids': [ident], 'titre': title,
                   'format': catalog[ident]['extension'], 'enseignements': list(nums),
                   'groupe': group, 'type_source': source_kind, 'source': key,
                   'dans_archive': row.get('chemin_dans_archive', '').split('/')[-1],
                   '_words': words}
            by_sha[sha] = doc
        report_rows.append({'id': ident, 'sha256_source': sha, 'index_id': doc['id'],
                            'texte_caracteres': len(body), 'mots_distincts': len(words),
                            'enseignements': nums, 'manifest': manifest_name})
    documents = list(by_sha.values())
    for doc in documents:
        doc['mots'] = ' '.join(sorted(doc.pop('_words')))
    new_teachings = {}
    for num in sorted(teaching_words, key=lambda n: (int(re.match(r'\d+', n)[0]), n)):
        new_teachings[num] = {'intervenants': existing.get(num, {}).get('intervenants', [])}
    index = {'version': 1, 'documents': documents}
    report = {'provenances': len(records), 'copies_verifiees': len(report_rows),
              'documents_distincts': len(documents), 'references_urls': len(urls),
              'non_indexes': omitted, 'documents': report_rows,
              'methode': 'Lexique propre à chaque document ; aucun vocabulaire d’un autre support du même enseignement. Doublons réunis par SHA256. Audio non transcrit, indexé par son titre.'}
    return index, new_teachings, urls, report


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--corpus', required=True, type=Path)
    ap.add_argument('--enseignements', required=True, type=Path)
    ap.add_argument('--index-sortie', required=True, type=Path)
    ap.add_argument('--enseignements-sortie', required=True, type=Path)
    ap.add_argument('--urls-sortie', required=True, type=Path)
    ap.add_argument('--rapport', required=True, type=Path)
    args = ap.parse_args()
    existing = json.loads(args.enseignements.read_text())
    result = build(args.corpus, existing)
    paths = [args.index_sortie, args.enseignements_sortie, args.urls_sortie, args.rapport]
    for path, data in zip(paths, result):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')
    print(json.dumps({k: v for k, v in result[-1].items() if k != 'documents'}, ensure_ascii=False))


if __name__ == '__main__':
    main()
