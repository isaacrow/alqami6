# ALQAMI objects as Moon records

ALQAMI shows what is catalogued in [Moon](https://mooon.site). Each `.jsonld` file here is a BIBFRAME record for one
of ALQAMI's built-in 3D objects, ready to import into Moon.

## Import one into Moon

1. In the Moon editor, open **Import BIBFRAME Record** and choose the `.jsonld` file.
2. Check the record, save it, and publish it as you would any record.
3. Within a few minutes ALQAMI shows that object from Moon: its card, titles and notes come from the published
   record, and the built-in copy steps aside.

## How ALQAMI reads a record

| What ALQAMI needs | Where it is in the record |
| --- | --- |
| The 3D model | `bf:electronicLocator` on the Item (or Instance), a link to a `.glb` or `.gltf` file |
| Which built-in object it replaces | `bf:identifiedBy` → `bf:Local` with the ALQAMI ID, e.g. `ALQ-HLM-004` |
| A three-dimensional object | Work type `bf:Object`, content type *three-dimensional form*, carrier *object* |

Any new object works the same way: catalogue it in Moon with a link to its 3D model on the Item, publish it, and it
appears in ALQAMI's gallery. The ALQAMI ID is only needed for the built-in objects.

Regenerate these files after changing `src/data/alqamiArtifacts.ts`:

```bash
npx esbuild scripts/moon-catalogue.ts --bundle --platform=node --outfile=moon-catalogue.cjs && node moon-catalogue.cjs && rm moon-catalogue.cjs
```
