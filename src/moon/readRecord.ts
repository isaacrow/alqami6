import { JsonLdNode, MoonRecord, opacUrl } from './moonApi';

/**
 * Turns a published Moon record (BIBFRAME 2/3 JSON-LD graph) into the plain fields ALQAMI's card shows.
 * Moon sometimes gives one value, sometimes an array, sometimes a node with rdfs:label, and names in both
 * Arabic and Latin script; everything here copes with all of those shapes.
 */

export type UiLang = 'ar' | 'en';

export interface MoonLink {
  label: string;
  uri?: string;
}

export interface MoonContributor extends MoonLink {
  role?: string;
  primary: boolean;
  /** Same person elsewhere: Wikidata, VIAF, LC, ISNI. */
  sameAs: string[];
}

export interface MoonCardData {
  id: string;
  workUri?: string;
  instanceUri?: string;
  title: string;
  subtitle?: string;
  /** True when the title is in Arabic script, so the card sets it right to left. */
  rtl: boolean;
  contributors: MoonContributor[];
  responsibility?: string;
  date?: string;
  place?: MoonLink;
  publisher?: MoonLink;
  edition?: string;
  series?: string;
  extent?: string;
  dimensions?: string;
  language?: MoonLink;
  genres: string[];
  content?: string;
  carrier?: string;
  subjects: MoonLink[];
  summary?: string;
  tableOfContents?: string;
  notes: string[];
  isbns: string[];
  otherIds: Array<{ type: string; value: string }>;
  classification: string[];
  shelfMarks: string[];
  holder?: string;
  /** The object's 3D model (glTF), from the Item's or Instance's bf:electronicLocator. */
  modelUrl?: string;
  /** ALQAMI's own identifier for the object (bf:Local, e.g. ALQ-HLM-004), when the record carries one. */
  alqamiId?: string;
  /** A three-dimensional object (bf:Object) rather than a text. */
  isObject: boolean;
  coverUrl?: string;
  opacUrl: string;
}

const MODEL_FILE = /\.(glb|gltf)(\?|#|$)/i;

const ARABIC = /[؀-ۿ]/;

const asArray = <T,>(v: T | T[] | undefined | null): T[] => (v == null ? [] : Array.isArray(v) ? v : [v]);

const hasType = (node: JsonLdNode, type: string) => asArray<string>(node['@type']).includes(type);

/** Every plain string a value carries: a string, an @value, or a node's rdfs:label. */
function texts(v: unknown): string[] {
  return asArray(v as unknown).flatMap((x: any) => {
    if (x == null) return [];
    if (typeof x === 'string' || typeof x === 'number') return [String(x).trim()].filter(Boolean);
    if (typeof x === 'object') {
      if ('@value' in x) return texts(x['@value']);
      if ('rdfs:label' in x) return texts(x['rdfs:label']);
    }
    return [];
  });
}

/** The one string to show: the form in the reader's script when Moon has both. */
export function pick(v: unknown, lang: UiLang): string | undefined {
  const all = texts(v);
  if (all.length < 2) return all[0];
  return all.find((t) => ARABIC.test(t) === (lang === 'ar')) ?? all[0];
}

/** "Author (مؤلف)" → "Author" or "مؤلف". */
function roleLabel(v: unknown, lang: UiLang): string | undefined {
  const label = pick(v, lang);
  const m = label && /^(.*?)\s*\(([^)]+)\)\s*$/.exec(label);
  if (!m) return label;
  const [en, ar] = ARABIC.test(m[2]) ? [m[1], m[2]] : [m[2], m[1]];
  return lang === 'ar' ? ar : en;
}

function link(v: unknown, lang: UiLang): MoonLink | undefined {
  const node = asArray<any>(v as any)[0];
  const label = pick(v, lang);
  if (!label) return undefined;
  return { label, uri: typeof node === 'object' ? node?.['@id'] : undefined };
}

function titleOf(node: JsonLdNode | undefined, lang: UiLang): { main?: string; sub?: string } {
  if (!node) return {};
  // A title and its parallel title in the other script: take the one in the reader's script.
  const all = asArray<any>(node['bf:title']).filter((x) => x && typeof x === 'object');
  const main = (t: any) => t['bf:mainTitle'] ?? t.mainTitle;
  const t = all.find((x) => texts(main(x)).some((s) => ARABIC.test(s) === (lang === 'ar'))) ?? all[0] ?? {};
  // Catalogue punctuation that separates title parts in a record ("Ali b. Abi Talib :") is not for display.
  const clean = (s?: string) => s?.replace(/\s*[:;/,=]\s*$/, '').trim() || undefined;
  return {
    main: clean(pick(main(t), lang) ?? pick(node['rdfs:label'], lang)),
    sub: clean(pick(t['bf:subtitle'], lang)),
  };
}

function classificationOf(v: unknown): string[] {
  return asArray<any>(v as any).flatMap((c) => {
    if (!c || typeof c !== 'object') return texts(c);
    const parts = [...texts(c['bf:classificationPortion']), ...texts(c['bf:itemPortion'])];
    return parts.length ? [parts.join(' ')] : texts(c);
  });
}

/**
 * Some records are stored flat: the work points at its title, summary or notes by ID ({"@id": "_:b1"}) and
 * those nodes sit elsewhere in the graph. Put them back in place, so every reader below sees one shape.
 * Works, instances and items stay separate (they point at each other and would loop).
 */
function embedReferences(graph: JsonLdNode[]): JsonLdNode[] {
  const byId = new Map(graph.filter((n) => n['@id']).map((n) => [n['@id'] as string, n]));
  const separate = (n: JsonLdNode) => ['bf:Work', 'bf:Instance', 'bf:Item'].some((t) => hasType(n, t));
  const embed = (v: any, depth: number): any => {
    if (Array.isArray(v)) return v.map((x) => embed(x, depth));
    if (!v || typeof v !== 'object' || depth > 4) return v;
    const target = Object.keys(v).length === 1 && v['@id'] ? byId.get(v['@id']) : undefined;
    const node = target && !separate(target) ? target : v;
    return Object.fromEntries(Object.entries(node).map(([k, x]) => [k, k.startsWith('@') ? x : embed(x, depth + 1)]));
  };
  return graph.map((n) => embed(n, 0));
}

// Language names for records that link a language without a label.
const LANGUAGES: Record<string, [string, string]> = {
  ara: ['العربية', 'Arabic'],
  eng: ['الإنجليزية', 'English'],
  per: ['الفارسية', 'Persian'],
  tur: ['التركية', 'Turkish'],
  urd: ['الأردية', 'Urdu'],
  fre: ['الفرنسية', 'French'],
  ger: ['الألمانية', 'German'],
  heb: ['العبرية', 'Hebrew'],
  syc: ['السريانية', 'Syriac'],
};

function languageOf(v: unknown, lang: UiLang): MoonLink | undefined {
  const found = link(v, lang);
  if (found) return found;
  const uri: string | undefined = asArray<any>(v as any)[0]?.['@id'];
  const names = uri && LANGUAGES[uri.replace(/^.*\//, '')];
  return names ? { label: names[lang === 'ar' ? 0 : 1], uri } : undefined;
}

export function readRecord(record: MoonRecord, lang: UiLang): MoonCardData {
  const graph = embedReferences(asArray<JsonLdNode>(record.document?.['@graph']));
  const work = graph.find((n) => hasType(n, 'bf:Work'));
  const instance = graph.find((n) => hasType(n, 'bf:Instance'));
  const items = graph.filter((n) => hasType(n, 'bf:Item'));
  const both = [work, instance].filter(Boolean) as JsonLdNode[];
  // A field Moon may put on the work or on the instance: the first one that holds words.
  const first = (key: string) => both.map((n) => n[key]).find((v) => texts(v).length > 0);

  const title = titleOf(work, lang).main ? titleOf(work, lang) : titleOf(instance, lang);

  const contributors = asArray<any>(work?.['bf:contribution']).flatMap((c): MoonContributor[] => {
    const agent = c?.['bf:agent'];
    const label = pick(agent, lang);
    if (!label) return [];
    return [
      {
        label,
        uri: agent?.['@id'],
        role: roleLabel(c['bf:role'], lang),
        primary: asArray<string>(c['@type']).includes('bf:PrimaryContribution'),
        sameAs: asArray<any>(agent?.['owl:sameAs']).map((s) => s?.['@id'] ?? s).filter((s) => typeof s === 'string'),
      },
    ];
  });
  contributors.sort((a, b) => Number(b.primary) - Number(a.primary));

  const provision = asArray<any>(instance?.['bf:provisionActivity'])[0] ?? {};
  const identifiers = asArray<any>(instance?.['bf:identifiedBy']);
  const isbns = identifiers.filter((i) => hasType(i, 'bf:Isbn')).flatMap((i) => texts(i['rdf:value']));
  const otherIds = identifiers
    .filter((i) => !hasType(i, 'bf:Isbn'))
    .flatMap((i) => texts(i['rdf:value']).map((value) => ({ type: asArray<string>(i['@type'])[0]?.replace(/^bf:/, '') ?? 'Id', value })));

  const notes = both.flatMap((n) => asArray<any>(n['bf:note']).flatMap((x) => texts(x)));

  return {
    id: record.id,
    workUri: work?.['@id'],
    instanceUri: instance?.['@id'],
    title: title.main ?? record.title,
    subtitle: title.sub,
    rtl: ARABIC.test(title.main ?? record.title ?? ''),
    contributors,
    responsibility: pick(instance?.['bf:responsibilityStatement'], lang),
    date: pick(provision['bf:date'], lang) ?? pick(work?.['bf:originDate'], lang),
    place: link(provision['bf:place'], lang) ?? link(work?.['bf:originPlace'], lang),
    publisher: link(provision['bf:agent'], lang),
    edition: pick(instance?.['bf:editionStatement'], lang),
    series: pick(instance?.['bf:seriesStatement'], lang),
    extent: pick(instance?.['bf:extent'], lang),
    dimensions: pick(instance?.['bf:dimensions'], lang),
    language: languageOf(work?.['bf:language'], lang),
    genres: asArray<any>(work?.['bf:genreForm']).flatMap((g) => asArray(pick(g, lang))),
    content: pick(work?.['bf:content'], lang),
    carrier: pick(instance?.['bf:carrier'], lang),
    subjects: asArray<any>(work?.['bf:subject']).flatMap((s) => asArray(link(s, lang))),
    summary: pick(first('bf:summary'), lang),
    tableOfContents: pick(first('bf:tableOfContents'), lang),
    notes,
    isbns,
    otherIds,
    classification: both.flatMap((n) => classificationOf(n['bf:classification'])),
    shelfMarks: items.flatMap((i) => texts(i['bf:shelfMark'])),
    holder: items.map((i) => pick(i['bf:heldBy'], lang)).find(Boolean),
    modelUrl: [...items, ...both]
      .flatMap((n) => asArray<any>(n['bf:electronicLocator']).map((l) => (typeof l === 'string' ? l : l?.['@id'])))
      .find((url) => typeof url === 'string' && MODEL_FILE.test(url)),
    alqamiId: otherIds.find((i) => /^ALQ-/i.test(i.value))?.value,
    isObject: !!work && hasType(work, 'bf:Object'),
    coverUrl: record.coverUrl || undefined,
    opacUrl: opacUrl(record.id),
  };
}
