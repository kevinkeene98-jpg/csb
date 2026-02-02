export type Restaurant = 'Chipotle' | 'Sweetgreen' | 'Cava';

export interface Option {
  id: string;
  text: string;
  description?: string;
  restaurant: Restaurant;
}

export interface Question {
  id: string;
  category: string;
  title: string;
  weight: number;
  options: Option[];
}

export const questions: Question[] = [
  {
    id: 'base',
    category: 'Choose a base',
    title: 'Which corporate archetype best describes you?',
    weight: 3,
    options: [
      { id: 'soldier', text: 'The Soldier', description: "Does what they're told. Never questions the roadmap.", restaurant: 'Sweetgreen' },
      { id: 'coaster', text: 'The Coaster', description: 'Puts in the minimum viable effort.', restaurant: 'Chipotle' },
      { id: 'vampire', text: 'The Vampire', description: 'Lives in dark mode. Literally and emotionally.', restaurant: 'Cava' },
      { id: 'existentialist', text: 'The Existentialist', description: 'Questions the purpose of the stand-up. Daily.', restaurant: 'Sweetgreen' },
      { id: 'lion', text: 'The Lion', description: 'Loudest and most incorrect in the room.', restaurant: 'Cava' },
    ],
  },
  {
    id: 'protein',
    category: 'Add protein',
    title: "What's your corporate superpower?",
    weight: 2,
    options: [
      { id: 'shapeshifting', text: 'Shapeshifting', description: 'Has a personality to match every Slack channel.', restaurant: 'Chipotle' },
      { id: 'xray', text: 'X-ray vision', description: 'Sees through it all. Says nothing.', restaurant: 'Sweetgreen' },
      { id: 'snake', text: 'Snake charming', description: 'Makes terrible ideas sound strategic.', restaurant: 'Cava' },
      { id: 'strength', text: 'Super strength', description: 'Does the work of three. Paid as one.', restaurant: 'Cava' },
      { id: 'invisibility', text: 'Invisibility', description: 'Survives every reorg unnoticed.', restaurant: 'Chipotle' },
    ],
  },
  {
    id: 'toppings',
    category: 'Toppings',
    title: 'What is your corporate quirk?',
    weight: 2,
    options: [
      { id: 'mansplaining', text: 'Mansplaining', description: 'Explains what everyone already knows. In detail.', restaurant: 'Cava' },
      { id: 'spine', text: 'Lacking a spine', description: "Says 'sounds good' to everything.", restaurant: 'Sweetgreen' },
      { id: 'nitpicking', text: 'Nitpicking', description: 'Fixates on the typo in a 40-page slide deck.', restaurant: 'Chipotle' },
      { id: 'interrupting', text: 'Interrupting', description: "Finishes everyone's sentences. Incorrectly.", restaurant: 'Cava' },
      { id: 'circles', text: 'Talking in circles', description: 'Uses 50 words when 5 would do.', restaurant: 'Chipotle' },
    ],
  },
  {
    id: 'extras',
    category: 'Extras',
    title: 'When are you most extra at work?',
    weight: 1,
    options: [
      { id: 'holiday', text: 'Company holiday party', description: 'Peaks at open bar. Regrets it by Monday.', restaurant: 'Sweetgreen' },
      { id: 'allhands', text: 'All-hands Q&A', description: 'Has follow-up questions to their follow-up questions.', restaurant: 'Chipotle' },
      { id: 'oneone', text: 'One-on-ones', description: 'Turns every check-in into a therapy session.', restaurant: 'Sweetgreen' },
      { id: 'icebreaker', text: 'The meeting icebreaker', description: 'Loses sleep over coming up with a fun fact.', restaurant: 'Cava' },
      { id: 'gossip', text: 'Lunchtime gossip', description: 'Has inside sources in every department.', restaurant: 'Sweetgreen' },
    ],
  },
];

export interface Answer {
  questionId: string;
  optionId: string;
  restaurant: Restaurant;
  weight: number;
}

export function calculateResult(answers: Answer[]): { winner: Restaurant; scores: Record<Restaurant, number> } {
  const scores: Record<Restaurant, number> = {
    Chipotle: 0,
    Sweetgreen: 0,
    Cava: 0,
  };

  // Calculate weighted scores
  for (const answer of answers) {
    scores[answer.restaurant] += answer.weight;
  }

  // Find the winner
  const maxScore = Math.max(...Object.values(scores));
  const tied = (Object.keys(scores) as Restaurant[]).filter(
    (r) => scores[r] === maxScore
  );

  // If there's a tie, use the base answer as tiebreaker
  let winner: Restaurant;
  if (tied.length > 1) {
    const baseAnswer = answers.find((a) => a.questionId === 'base');
    winner = baseAnswer?.restaurant || tied[0];
  } else {
    winner = tied[0];
  }

  return { winner, scores };
}
