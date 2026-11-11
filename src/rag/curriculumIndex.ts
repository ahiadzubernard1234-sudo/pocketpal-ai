import {Bm25Index, type CurriculumChunk, type SearchHit} from './bm25';

// The curriculum notes are bundled with the app. This placeholder file is
// empty; replace it with the output of tools/build_curriculum_index.py
// (see docs/RAG.md). While it is empty, retrieval simply returns nothing and
// StudyMate behaves exactly as it did before.
import curriculumData from './data/curriculum.json';

interface CurriculumFile {
  version: number;
  chunks: CurriculumChunk[];
}

let index: Bm25Index | null = null;

function getIndex(): Bm25Index {
  if (!index) {
    const file = curriculumData as unknown as CurriculumFile;
    index = new Bm25Index(file.chunks ?? []);
  }
  return index;
}

/** Number of curriculum passages available (0 until you add notes). */
export function curriculumSize(): number {
  return getIndex().size;
}

/** Finds the curriculum passages that best match a student's question. */
export function retrieve(query: string, limit = 3): SearchHit[] {
  return getIndex().search(query, limit);
}
