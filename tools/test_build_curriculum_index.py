"""Tests for build_curriculum_index.py. Run from the tools folder:

    python -m unittest
"""

import unittest

import build_curriculum_index as builder


def sentence(letter: str, length: int) -> str:
    """A sentence of exactly `length` characters (letters plus a full stop)."""
    return letter * (length - 1) + "."


class MakeChunksTests(unittest.TestCase):
    def test_two_long_sentences_never_exceed_max_chars(self):
        # 701 + 501 characters: joining them (with overlap) used to give 1,203.
        text = sentence("x", 701) + " " + sentence("y", 501)
        chunks = builder.make_chunks(text)

        self.assertTrue(chunks)
        self.assertTrue(all(len(c) <= builder.MAX_CHARS for c in chunks))
        self.assertIn("x" * 700, " ".join(chunks))
        self.assertIn("y" * 500, " ".join(chunks))

    def test_single_sentence_longer_than_max_is_split(self):
        text = ("word " * 400).strip() + "."   # 2,000 characters, one sentence
        chunks = builder.make_chunks(text)

        self.assertGreaterEqual(len(chunks), 2)
        self.assertTrue(all(len(c) <= builder.MAX_CHARS for c in chunks))

    def test_one_enormous_word_is_cut(self):
        chunks = builder.make_chunks("z" * 3000)

        self.assertGreaterEqual(len(chunks), 3)
        self.assertTrue(all(len(c) <= builder.MAX_CHARS for c in chunks))

    def test_last_sentence_is_repeated_as_overlap(self):
        sentences = [sentence(chr(ord("a") + i), 300) for i in range(6)]
        chunks = builder.make_chunks(" ".join(sentences))

        self.assertGreaterEqual(len(chunks), 2)
        self.assertTrue(chunks[0].endswith(sentences[1]))
        self.assertTrue(chunks[1].startswith(sentences[1]))
        self.assertTrue(all(len(c) <= builder.MAX_CHARS for c in chunks))

    def test_final_chunk_is_kept_when_long_enough(self):
        text = " ".join(sentence(chr(ord("a") + i), 300) for i in range(3))
        chunks = builder.make_chunks(text)

        self.assertIn(sentence("c", 300), chunks[-1])

    def test_tiny_fragments_are_dropped(self):
        self.assertEqual(builder.make_chunks("Short."), [])
        self.assertEqual(builder.make_chunks(""), [])


class CleanTests(unittest.TestCase):
    def test_rejoins_hyphenated_line_breaks(self):
        self.assertEqual(builder.clean("photo-\nsynthesis"), "photosynthesis")

    def test_turns_newlines_into_spaces(self):
        self.assertEqual(builder.clean("one\ntwo\n\nthree"), "one two three")


if __name__ == "__main__":
    unittest.main()
