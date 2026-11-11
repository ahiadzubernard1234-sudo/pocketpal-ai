/**
 * Tiny, dependency-free BM25 search engine for StudyMate's curriculum notes.
 *
 * BM25 is a classic way to rank text passages by how well they match a
 * question's words. It needs no AI model and no extra memory, so it is a good
 * fit for 4 GB phones. (A smarter embedding-based search can be added later.)
 */

export interface CurriculumChunk {
  id: string;
  /** e.g. "Integrated Science" */
  subject?: string;
  /** e.g. the PDF the passage came from */
  source?: string;
  page?: number;
  text: string;
}

export interface SearchHit {
  chunk: CurriculumChunk;
  score: number;
}

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'but', 'by', 'can',
  'did', 'do', 'does', 'for', 'from', 'had', 'has', 'have', 'how', 'i', 'if',
  'in', 'is', 'it', 'its', 'me', 'my', 'of', 'on', 'or', 'our', 'so', 'than',
  'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this',
  'to', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'who', 'why',
  'will', 'with', 'you', 'your', 'explain', 'please', 'tell', 'about',
]);

/** Very light English stemmer so "plants", "plant" and "planting" match. */
function stem(word: string): string {
  let w = word;
  if (w.length > 4 && w.endsWith('ies')) {
    w = w.slice(0, -3) + 'y';
  } else if (w.length > 5 && w.endsWith('ing')) {
    w = w.slice(0, -3);
  } else if (w.length > 4 && w.endsWith('ed')) {
    w = w.slice(0, -2);
  }
  if (
    w.length > 3 &&
    w.endsWith('s') &&
    !w.endsWith('ss') &&
    !w.endsWith('us') &&
    !w.endsWith('is')
  ) {
    w = w.slice(0, -1);
  }
  if (w.length > 3 && w.endsWith('e')) {
    w = w.slice(0, -1);
  }
  return w;
}

export function tokenize(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/);
  const tokens: string[] = [];
  for (const word of words) {
    if (!word || STOPWORDS.has(word)) {
      continue;
    }
    if (word.length < 2 && !/\d/.test(word)) {
      continue;
    }
    tokens.push(stem(word));
  }
  return tokens;
}

export class Bm25Index {
  private readonly chunks: CurriculumChunk[];
  private readonly docLengths: number[] = [];
  /** term -> list of [docIndex, termFrequency] */
  private readonly postings = new Map<string, Array<[number, number]>>();
  private readonly avgDocLength: number;

  constructor(
    chunks: CurriculumChunk[],
    private readonly k1 = 1.5,
    private readonly b = 0.75,
  ) {
    this.chunks = chunks;
    let totalLength = 0;

    chunks.forEach((chunk, docIndex) => {
      // Searching by subject/source name too lets "physics ohm's law" find
      // passages from the Physics notes.
      const tokens = tokenize(
        `${chunk.subject ?? ''} ${chunk.text}`,
      );
      this.docLengths.push(tokens.length);
      totalLength += tokens.length;

      const counts = new Map<string, number>();
      for (const token of tokens) {
        counts.set(token, (counts.get(token) ?? 0) + 1);
      }
      counts.forEach((tf, term) => {
        const list = this.postings.get(term);
        if (list) {
          list.push([docIndex, tf]);
        } else {
          this.postings.set(term, [[docIndex, tf]]);
        }
      });
    });

    this.avgDocLength = chunks.length > 0 ? totalLength / chunks.length : 0;
  }

  get size(): number {
    return this.chunks.length;
  }

  /**
   * Returns the best matching passages for a question, best first.
   * A passage must match at least two of the question's words (or the only
   * word, for very short questions) so unrelated text is never returned.
   */
  search(query: string, limit = 3): SearchHit[] {
    const queryTerms = Array.from(new Set(tokenize(query)));
    if (queryTerms.length === 0 || this.chunks.length === 0) {
      return [];
    }

    const totalDocs = this.chunks.length;
    const scores = new Map<number, {score: number; matched: number}>();

    for (const term of queryTerms) {
      const list = this.postings.get(term);
      if (!list) {
        continue;
      }
      const docFreq = list.length;
      const idf = Math.log(1 + (totalDocs - docFreq + 0.5) / (docFreq + 0.5));

      for (const [docIndex, tf] of list) {
        const lengthNorm =
          1 - this.b + (this.b * this.docLengths[docIndex]) / this.avgDocLength;
        const termScore =
          (idf * (tf * (this.k1 + 1))) / (tf + this.k1 * lengthNorm);

        const entry = scores.get(docIndex);
        if (entry) {
          entry.score += termScore;
          entry.matched += 1;
        } else {
          scores.set(docIndex, {score: termScore, matched: 1});
        }
      }
    }

    const minMatched = Math.min(2, queryTerms.length);
    const hits: SearchHit[] = [];
    scores.forEach((entry, docIndex) => {
      if (entry.matched >= minMatched) {
        hits.push({chunk: this.chunks[docIndex], score: entry.score});
      }
    });

    hits.sort((a, b) => b.score - a.score);
    return hits.slice(0, limit);
  }
}
