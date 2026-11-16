import {buildRagFragment} from '../ragPrompt';
import {retrieve} from '../curriculumIndex';

jest.mock('../curriculumIndex', () => ({
  retrieve: jest.fn(),
}));

const mockRetrieve = retrieve as jest.MockedFunction<typeof retrieve>;

describe('buildRagFragment', () => {
  beforeEach(() => {
    mockRetrieve.mockReset();
  });

  it('returns null for an empty question without searching', () => {
    expect(buildRagFragment('   ')).toBeNull();
    expect(mockRetrieve).not.toHaveBeenCalled();
  });

  it('returns null when nothing relevant is found', () => {
    mockRetrieve.mockReturnValue([]);
    expect(buildRagFragment('Who won the match?')).toBeNull();
  });

  it('labels each passage the way the model should cite it', () => {
    mockRetrieve.mockReturnValue([
      {
        chunk: {
          id: 'sci-1',
          subject: 'Integrated Science',
          source: 'Integrated Science.pdf',
          page: 12,
          text: 'Photosynthesis is how green plants make food.',
        },
        score: 3,
      },
    ]);

    const result = buildRagFragment('What is photosynthesis?');

    expect(result).toContain(
      '[1] (Integrated Science notes, page 12) Photosynthesis is how green plants make food.',
    );
    expect(result).toContain('never invent page numbers');
  });

  it('falls back to the source name when there is no subject', () => {
    mockRetrieve.mockReturnValue([
      {
        chunk: {id: 'x', source: 'Syllabus.pdf', text: 'Some text here.'},
        score: 1,
      },
    ]);

    const result = buildRagFragment('syllabus');

    expect(result).toContain('[1] (Syllabus.pdf) Some text here.');
  });

  it('does not invent a page number when the passage has none', () => {
    mockRetrieve.mockReturnValue([
      {
        chunk: {id: 'x', subject: 'ICT', text: 'Some text here.'},
        score: 1,
      },
    ]);

    const result = buildRagFragment('ict');

    expect(result).toContain('[1] (ICT notes) Some text here.');
    expect(result).not.toContain('page undefined');
  });

  it('keeps the notes within the size budget', () => {
    mockRetrieve.mockReturnValue([
      {
        chunk: {id: 'long', subject: 'History', text: 'word '.repeat(2000)},
        score: 2,
      },
    ]);

    const result = buildRagFragment('history') as string;

    expect(result.length).toBeLessThan(2300);
  });
});
