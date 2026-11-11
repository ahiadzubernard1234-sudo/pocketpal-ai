"""
Build StudyMate's curriculum notes file from PDFs.

What this does (in plain words):
  1. Reads every PDF in a folder (for example the official Ghana SHS curriculum).
  2. Cuts the text into short passages (about 800 characters each).
  3. Saves them as one JSON file that the app searches when a student asks a
     question. This is the "retrieval" part of RAG.

Usage (works on Google Colab or any computer with Python):
    pip install pypdf
    python tools/build_curriculum_index.py  my_pdfs/  src/rag/data/curriculum.json

Name each PDF after its subject, e.g. "Integrated Science.pdf" or
"ICT.pdf": the file name becomes the subject label shown to the model.

Note: this only works on PDFs that contain real text. Scanned (photo) PDFs
need OCR first.
"""

import json
import re
import sys
from pathlib import Path

from pypdf import PdfReader

TARGET_CHARS = 800   # aim for passages about this long
MAX_CHARS = 1100     # never go beyond this
MIN_CHARS = 120      # drop tiny fragments (page numbers, headings)


def clean(text: str) -> str:
    text = text.replace("\u00ad", "")           # soft hyphens
    text = re.sub(r"-\n(?=[a-z])", "", text)      # re-join hyphenated line breaks
    text = re.sub(r"\s*\n\s*", " ", text)         # newlines -> spaces
    text = re.sub(r"\s{2,}", " ", text)           # collapse spaces
    return text.strip()


def split_sentences(text: str):
    return [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]


def make_chunks(text: str):
    """Pack sentences into passages, repeating the last sentence as overlap."""
    chunks, current = [], []
    length = 0
    for sentence in split_sentences(text):
        sentence = sentence[:MAX_CHARS]
        if current and length + len(sentence) > TARGET_CHARS:
            chunks.append(" ".join(current))
            current = [current[-1]]            # overlap
            length = len(current[0])
        current.append(sentence)
        length += len(sentence) + 1
    if current:
        chunks.append(" ".join(current))
    return [c for c in chunks if len(c) >= MIN_CHARS]


def main():
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)

    pdf_dir, out_path = Path(sys.argv[1]), Path(sys.argv[2])
    pdfs = sorted(pdf_dir.glob("*.pdf"))
    if not pdfs:
        print(f"No PDF files found in {pdf_dir}")
        sys.exit(1)

    all_chunks = []
    for pdf in pdfs:
        subject = re.sub(r"[_\-]+", " ", pdf.stem).strip()
        reader = PdfReader(str(pdf))
        count_before = len(all_chunks)
        for page_number, page in enumerate(reader.pages, start=1):
            text = clean(page.extract_text() or "")
            for n, chunk in enumerate(make_chunks(text), start=1):
                all_chunks.append({
                    "id": f"{pdf.stem}-p{page_number}-{n}",
                    "subject": subject,
                    "source": pdf.name,
                    "page": page_number,
                    "text": chunk,
                })
        print(f"{pdf.name}: {len(all_chunks) - count_before} passages")

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(
        json.dumps({"version": 1, "chunks": all_chunks}, ensure_ascii=False),
        encoding="utf-8",
    )
    size_mb = out_path.stat().st_size / (1024 * 1024)
    print(f"\nSaved {len(all_chunks)} passages to {out_path} ({size_mb:.1f} MB)")


if __name__ == "__main__":
    main()
