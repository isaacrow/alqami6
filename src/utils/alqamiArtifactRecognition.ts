import { ALQAMI_ARTIFACTS } from '../data/alqamiArtifacts';

interface RecognitionIndexEntry {
  sourceId: string;
  catalogId: string;
  recognitionThreshold: number;
  embeddings: Array<{ view: string; vector: number[] }>;
}

export interface ArtifactRecognitionResult {
  artifactId: string;
  score: number;
}

/**
 * Closed-set artifact recognition using the saved reference embeddings from alqami3-main.
 * It reads frames from the already-open AR camera; it never requests a second camera stream.
 */
export class AlqamiArtifactRecognizer {
  private tf: typeof import('@tensorflow/tfjs') | null = null;
  private model: import('@tensorflow-models/mobilenet').MobileNet | null = null;
  private entries: RecognitionIndexEntry[] = [];
  private crop = document.createElement('canvas');
  private ctx = this.crop.getContext('2d', { willReadFrequently: true });
  private loading: Promise<void> | null = null;
  private disposed = false;

  async init() {
    if (this.model && this.entries.length) return;
    if (this.loading) return this.loading;
    this.disposed = false;

    this.loading = (async () => {
      const [tf, mobilenet] = await Promise.all([
        import('@tensorflow/tfjs'),
        import('@tensorflow-models/mobilenet'),
      ]);
      // CPU inference avoids creating a second WebGL context beside the AR renderer on iPhone Safari.
      await tf.setBackend('cpu');
      await tf.ready();
      const response = await fetch(assetUrlForRecognitionIndex());
      if (!response.ok) throw new Error(`Recognition index request failed (${response.status})`);
      const entries = (await response.json()) as RecognitionIndexEntry[];
      const knownIds = new Set(ALQAMI_ARTIFACTS.map((artifact) => artifact.id));
      this.entries = entries.filter((entry) => knownIds.has(entry.catalogId) && entry.embeddings.length > 0);
      if (!this.entries.length) throw new Error('No saved artifact reference views are available.');
      this.tf = tf;
      const model = await mobilenet.load({ version: 2, alpha: 1.0 });
      if (this.disposed) {
        model.dispose();
        return;
      }
      this.model = model;
      this.crop.width = 224;
      this.crop.height = 224;
    })().finally(() => {
      this.loading = null;
    });

    return this.loading;
  }

  async recognize(video: HTMLVideoElement): Promise<ArtifactRecognitionResult | null> {
    await this.init();
    if (!this.tf || !this.model || !this.ctx || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return null;

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (width < 1 || height < 1) return null;
    const side = Math.round(Math.min(width, height) * 0.68);
    const x = Math.round((width - side) / 2);
    const y = Math.round((height - side) / 2);
    this.ctx.drawImage(video, x, y, side, side, 0, 0, 224, 224);

    const embedding = this.tf.tidy(() => {
      const features = this.model!.infer(this.crop, true).reshape([-1]);
      const norm = features.norm();
      return Array.from(features.div(norm).dataSync());
    });

    let best: ArtifactRecognitionResult | null = null;
    for (const entry of this.entries) {
      let score = 0;
      for (const reference of entry.embeddings) {
        const vector = reference.vector;
        if (vector.length !== embedding.length) continue;
        let dot = 0;
        let queryNormSq = 0;
        let referenceNormSq = 0;
        for (let i = 0; i < vector.length; i++) {
          dot += embedding[i] * vector[i];
          queryNormSq += embedding[i] * embedding[i];
          referenceNormSq += vector[i] * vector[i];
        }
        const denominator = Math.sqrt(queryNormSq * referenceNormSq);
        if (denominator > 0) score = Math.max(score, dot / denominator);
      }
      if (!best || score > best.score) best = { artifactId: entry.catalogId, score };
    }

    const candidate = this.entries.find((entry) => entry.catalogId === best?.artifactId);
    return candidate && best && best.score >= candidate.recognitionThreshold ? best : null;
  }

  dispose() {
    this.disposed = true;
    this.model?.dispose();
    this.model = null;
    this.entries = [];
    this.crop.width = 0;
    this.crop.height = 0;
    this.tf = null;
  }
}

function assetUrlForRecognitionIndex() {
  const base = import.meta.env.BASE_URL || './';
  return `${base}data/alqami-recognition-index.json`;
}
