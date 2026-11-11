# Curriculum notes (RAG) in StudyMate

**RAG** stands for *Retrieval-Augmented Generation*. In plain words: before the
model answers, the app first **looks up the most relevant passages from the
curriculum** and adds them to the prompt. The small model then answers using
real notes instead of relying only on what it memorised. This is how StudyMate
keeps a tiny 0.6B model accurate on the Ghana SHS syllabus.

```
student question
      |
      v
 search the curriculum notes (BM25)  ->  top 3 short passages
      |
      v
 system prompt = tutor prompt + passages
      |
      v
 model writes the answer
```

## How it works in the code

| File | Job |
| --- | --- |
| `tools/build_curriculum_index.py` | Run once on a computer or Colab. Turns curriculum PDFs into `curriculum.json`. |
| `src/rag/data/curriculum.json` | The notes bundled in the app (empty placeholder until you generate it). |
| `src/rag/bm25.ts` | The search engine (BM25). No AI model, no extra RAM. |
| `src/rag/curriculumIndex.ts` | Loads the notes once and answers `retrieve(question)`. |
| `src/rag/ragPrompt.ts` | Formats the top passages (about 350 tokens max) and tells the model to use them. |
| `src/hooks/useChatSession.ts` | Calls `buildRagFragment(question)` for each message and adds the result to the system prompt. |

The notes are added to the model's input only. They are not shown in the chat.
If nothing relevant is found, or `curriculum.json` is empty, the prompt is left
unchanged.

## Add your curriculum

1. Put your curriculum PDFs in one folder. **Name each file after its subject**
   (for example `Integrated Science.pdf`, `ICT.pdf`). The name is used as the
   subject label.
2. On Google Colab (or any computer with Python):

   ```bash
   pip install pypdf
   python tools/build_curriculum_index.py my_pdfs/ src/rag/data/curriculum.json
   ```

3. Replace `src/rag/data/curriculum.json` in the project with the generated
   file, then rebuild the app (`yarn android`).

Scanned (photographed) PDFs have no real text, so they need OCR first.

## Why BM25 first, and what comes next

BM25 ranks passages by matching the question's words. It is fast, works fully
offline, and adds no memory cost, which matters on 4 GB phones. Its weakness is
that it matches *words*, not *meaning* ("how do plants make food" will not match a
passage that only says "photosynthesis" and never uses those words).

Planned upgrades, in order:

1. **In-app import** of a curriculum file (behind the Advanced settings lock) so
   notes can be updated without rebuilding the app.
2. **Embedding search** with a small embedding model (Qwen3-Embedding-0.6B GGUF)
   for meaning-based matching. Passage embeddings are computed ahead of time on a
   computer; only the student's question is embedded on the phone. Mixing it with
   BM25 usually gives the best results. This needs a second model in memory, so
   test it on a 4 GB phone first.
3. **Per-subject filtering** (e.g. only search Physics notes when the student is
   in a Physics chat).

## Limits to know about

- The app only retrieves from the latest question. Short follow-ups such as
  "why?" may not find good passages.
- Retrieved text takes space in the model's context window, so keep
  `MAX_TOTAL_CHARS` in `ragPrompt.ts` modest on small phones.
- Quality depends on how clean the extracted PDF text is. Spot-check
  `curriculum.json` after generating it.
