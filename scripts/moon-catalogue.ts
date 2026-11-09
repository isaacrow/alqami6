/**
 * Writes one BIBFRAME 2/3 JSON-LD record per ALQAMI object into catalogue/, ready for Moon's
 * "Import BIBFRAME Record" dialog (JSON-LD). Once a record is imported and published in Moon, ALQAMI reads the
 * object from Moon: it matches the record by the object's ALQAMI identifier (bf:Local) and loads the 3D model
 * the record's Item points to (bf:electronicLocator).
 *
 * Run: npx esbuild scripts/moon-catalogue.ts --bundle --platform=node --outfile=<tmp>.cjs && node <tmp>.cjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ALQAMI_ARTIFACTS, AlqamiArtifact } from '../src/data/alqamiArtifacts';

const SITE = 'https://isaacrow.github.io/alqami6';
const OUT = join(process.cwd(), 'catalogue');

const ar = (value: string) => ({ '@value': value, '@language': 'ar' });
const en = (value: string) => ({ '@value': value, '@language': 'en' });
const both = (pair: { ar: string; en: string } | undefined) => (pair ? [ar(pair.ar), en(pair.en)] : undefined);
const note = (pair: { ar: string; en: string } | undefined, kind: string) =>
  pair ? { '@type': 'bf:Note', 'bf:noteType': kind, 'rdfs:label': both(pair) } : undefined;

function record(a: AlqamiArtifact) {
  const base = `${SITE}/catalogue/${a.slug}`;
  const work = `${base}#work`;
  const instance = `${base}#instance`;
  const item = `${base}#item`;
  const titles = [
    { '@type': 'bf:Title', 'bf:mainTitle': ar(a.title.ar), ...(a.subtitle ? { 'bf:subtitle': ar(a.subtitle.ar) } : {}) },
    { '@type': 'bf:ParallelTitle', 'bf:mainTitle': en(a.title.en), ...(a.subtitle ? { 'bf:subtitle': en(a.subtitle.en) } : {}) },
  ];
  const isManuscript = a.category === 'manuscripts';

  return {
    '@context': {
      bf: 'http://id.loc.gov/ontologies/bibframe/',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    },
    '@graph': [
      {
        '@id': work,
        '@type': ['bf:Work', isManuscript ? 'bf:Text' : 'bf:Object'],
        'bf:title': titles,
        'bf:content': isManuscript
          ? { '@id': 'http://id.loc.gov/vocabulary/contentTypes/txt', 'rdfs:label': 'text' }
          : { '@id': 'http://id.loc.gov/vocabulary/contentTypes/tdf', 'rdfs:label': 'three-dimensional form' },
        'bf:genreForm': { '@type': 'bf:GenreForm', 'rdfs:label': both(a.categoryLabel) },
        'bf:originDate': a.period.en,
        'bf:summary': { '@type': 'bf:Summary', 'rdfs:label': both(a.description) },
        'bf:hasInstance': { '@id': instance },
      },
      {
        '@id': instance,
        '@type': isManuscript ? ['bf:Instance', 'bf:Manuscript'] : ['bf:Instance'],
        'bf:instanceOf': { '@id': work },
        'bf:title': titles,
        'bf:responsibilityStatement': both(a.creator),
        'bf:media': { '@id': 'http://id.loc.gov/vocabulary/mediaTypes/n', 'rdfs:label': 'unmediated' },
        'bf:carrier': isManuscript
          ? { '@id': 'http://id.loc.gov/vocabulary/carriers/nc', 'rdfs:label': 'volume' }
          : { '@id': 'http://id.loc.gov/vocabulary/carriers/nr', 'rdfs:label': 'object' },
        'bf:dimensions': a.details.dimensions,
        'bf:identifiedBy': { '@type': 'bf:Local', 'rdf:value': a.id, 'bf:assigner': { '@type': 'bf:Agent', 'rdfs:label': 'ALQAMI' } },
        'bf:note': [
          note(a.details.material, 'material'),
          note(a.details.condition, 'condition'),
          note(a.details.binding, 'binding'),
          note(a.details.decoration, 'decoration'),
          note(a.details.seals, 'ownership marks'),
        ].filter(Boolean),
        'bf:hasItem': { '@id': item },
      },
      {
        '@id': item,
        '@type': 'bf:Item',
        'bf:itemOf': { '@id': instance },
        'bf:shelfMark': { '@type': 'bf:ShelfMark', 'rdfs:label': a.itemCode },
        'bf:heldBy': { '@type': 'bf:Agent', 'rdfs:label': both(a.institution) },
        // The 3D model of the object: ALQAMI shows it from this link.
        'bf:electronicLocator': { '@id': `${SITE}${a.model.glb}` },
        'bf:note': { '@type': 'bf:Note', 'rdfs:label': [ar('نموذج ثلاثي الأبعاد (glTF)'), en('3D model (glTF)')] },
      },
    ],
  };
}

mkdirSync(OUT, { recursive: true });
for (const a of ALQAMI_ARTIFACTS) {
  writeFileSync(join(OUT, `${a.slug}.jsonld`), `${JSON.stringify(record(a), null, 2)}\n`);
}
console.log(`Wrote ${ALQAMI_ARTIFACTS.length} records to ${OUT}`);
