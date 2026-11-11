import {Bm25Index, tokenize} from '../bm25';

const chunks = [
  {
    id: 'sci-1',
    subject: 'Integrated Science',
    text: 'Photosynthesis is the process by which green plants make food using sunlight, water and carbon dioxide.',
  },
  {
    id: 'sci-2',
    subject: 'Integrated Science',
    text: 'Respiration releases energy from food in the cells of living organisms.',
  },
  {
    id: 'econ-1',
    subject: 'Economics',
    text: 'Demand is the quantity of a good consumers are willing to buy at a given price.',
  },
];

describe('tokenize', () => {
  it('lowercases, drops stopwords and stems simple endings', () => {
    expect(tokenize('What are the Plants doing?')).toEqual(
      expect.arrayContaining(['plant']),
    );
    expect(tokenize('the and of')).toEqual([]);
  });

  it('matches singular and plural forms', () => {
    expect(tokenize('plants')).toEqual(tokenize('plant'));
  });
});

describe('Bm25Index', () => {
  const index = new Bm25Index(chunks);

  it('finds the most relevant passage first', () => {
    const hits = index.search('How do green plants make food from sunlight?');
    expect(hits[0].chunk.id).toBe('sci-1');
  });

  it('can search by subject name', () => {
    const hits = index.search('economics demand and price');
    expect(hits[0].chunk.id).toBe('econ-1');
  });

  it('returns nothing for unrelated questions', () => {
    expect(index.search('football world cup winners')).toEqual([]);
  });

  it('returns nothing for an empty index or query', () => {
    expect(new Bm25Index([]).search('photosynthesis')).toEqual([]);
    expect(index.search('   ')).toEqual([]);
  });

  it('respects the limit', () => {
    expect(index.search('food energy cells plants', 1)).toHaveLength(1);
  });
});
