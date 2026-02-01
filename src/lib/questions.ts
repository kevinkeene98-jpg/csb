export type Restaurant = 'Chipotle' | 'Sweetgreen' | 'Cava';

export interface Option {
  id: string;
  text: string;
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
      { id: 'soldier', text: 'The Soldier', restaurant: 'Sweetgreen' },
      { id: 'coaster', text: 'The Coaster', restaurant: 'Chipotle' },
      { id: 'vampire', text: 'The Vampire', restaurant: 'Cava' },
      { id: 'existentialist', text: 'The Existentialist', restaurant: 'Sweetgreen' },
      { id: 'lion', text: 'The Lion', restaurant: 'Cava' },
    ],
  },
  {
    id: 'protein',
    category: 'Add protein',
    title: "What's your corporate superpower?",
    weight: 2,
    options: [
      { id: 'shapeshifting', text: 'Shapeshifting', restaurant: 'Chipotle' },
      { id: 'xray', text: 'X-ray vision', restaurant: 'Sweetgreen' },
      { id: 'snake', text: 'Snake charming', restaurant: 'Cava' },
      { id: 'strength', text: 'Super strength', restaurant: 'Cava' },
      { id: 'invisibility', text: 'Invisibility', restaurant: 'Chipotle' },
    ],
  },
  {
    id: 'toppings',
    category: 'Toppings',
    title: 'What is your corporate quirk?',
    weight: 2,
    options: [
      { id: 'mansplaining', text: 'Mansplaining', restaurant: 'Cava' },
      { id: 'spine', text: 'Lacking a spine', restaurant: 'Sweetgreen' },
      { id: 'nitpicking', text: 'Nitpicking', restaurant: 'Chipotle' },
      { id: 'interrupting', text: 'Interrupting', restaurant: 'Cava' },
      { id: 'circles', text: 'Talking in circles', restaurant: 'Chipotle' },
    ],
  },
  {
    id: 'extras',
    category: 'Extras',
    title: 'When are you most extra at work?',
    weight: 1,
    options: [
      { id: 'holiday', text: 'Company holiday party', restaurant: 'Sweetgreen' },
      { id: 'allhands', text: 'All-hands Q&A', restaurant: 'Chipotle' },
      { id: 'oneone', text: 'One-on-one therapy sessions', restaurant: 'Sweetgreen' },
      { id: 'icebreaker', text: 'The meeting icebreaker', restaurant: 'Cava' },
      { id: 'gossip', text: 'Lunchtime gossip', restaurant: 'Sweetgreen' },
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
