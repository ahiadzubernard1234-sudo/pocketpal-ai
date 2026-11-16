import {retrieve} from './curriculumIndex';

// Keep the notes short: StudyMate targets small models on 4 GB phones, where
// every extra token costs speed and leaves less room for the conversation.
// 1,400 characters is roughly 350 tokens.
const MAX_PASSAGES = 3;
const MAX_TOTAL_CHARS = 1400;

const INSTRUCTION =
  "Curriculum notes for the student's latest question are below. " +
  'Base your answer on these notes when they are relevant. ' +
  'When you use a note, say where it came from in plain words, for example "According to the Integrated Science notes, page 12". ' +
  'Only mention sources that appear in the notes below, and never invent page numbers. ' +
  'If the notes do not cover the question, say so briefly, then answer carefully from general knowledge.';

/**
 * Builds the extra system-prompt text for a question, or null when nothing
 * relevant was found (so the chat prompt is left untouched).
 */
export function buildRagFragment(question: string): string | null {
  const trimmed = question?.trim();
  if (!trimmed) {
    return null;
  }

  const hits = retrieve(trimmed, MAX_PASSAGES);
  if (hits.length === 0) {
    return null;
  }

  let remaining = MAX_TOTAL_CHARS;
  const passages: string[] = [];

  hits.forEach(({chunk}, i) => {
    if (remaining <= 0) {
      return;
    }
    // Written the way the model should quote it, e.g.
    // "Integrated Science notes, page 12".
    const label = [
      chunk.subject ? `${chunk.subject} notes` : chunk.source,
      chunk.page != null ? `page ${chunk.page}` : undefined,
    ]
      .filter(Boolean)
      .join(', ');

    let text = chunk.text.trim();
    if (text.length > remaining) {
      text = text.slice(0, remaining).trimEnd() + '…';
    }
    remaining -= text.length;
    passages.push(`[${i + 1}] ${label ? `(${label}) ` : ''}${text}`);
  });

  return `${INSTRUCTION}\n\n${passages.join('\n\n')}`;
}
