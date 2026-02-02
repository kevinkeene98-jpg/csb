'use client';

import { Question, Option } from '@/lib/questions';

interface QuestionCardProps {
  question: Question;
  selectedOption: string | null;
  onSelect: (optionId: string, option: Option) => void;
  questionNumber: number;
  totalQuestions: number;
}

export function QuestionCard({
  question,
  selectedOption,
  onSelect,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm uppercase tracking-wider text-receipt-black/60">
          {question.category}
        </div>
        <div className="text-sm text-receipt-black/40">
          {questionNumber} of {totalQuestions}
        </div>
      </div>

      <h2 className="text-xl mb-6 text-receipt-black">{question.title}</h2>

      <div className="space-y-2">
        {question.options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id, option)}
            className={`w-full text-left px-4 py-3 border border-receipt-gray option-button ${
              selectedOption === option.id ? 'selected' : ''
            }`}
          >
            <span className="text-receipt-black font-bold">{option.text}</span>
            {option.description && (
              <span className="block text-sm text-receipt-black/60 mt-1">{option.description}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
