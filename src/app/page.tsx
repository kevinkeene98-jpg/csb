'use client';

import { useState, useEffect, useCallback } from 'react';
import { questions, Question, Option, Answer, Restaurant, calculateResult } from '@/lib/questions';
import { OrderHeader } from '@/components/OrderHeader';
import { NameInput } from '@/components/NameInput';
import { QuestionCard } from '@/components/QuestionCard';
import { ResultCard } from '@/components/ResultCard';
import { LoadingState } from '@/components/LoadingState';
import { LogoCarousel } from '@/components/LogoCarousel';

type Stage = 'intro' | 'questions' | 'loading' | 'result';

interface Result {
  restaurant: Restaurant;
  roast: string;
  secretWeapon: string;
  blurb: string;
  scores: Record<Restaurant, number>;
}

export default function Home() {
  const [stage, setStage] = useState<Stage>('intro');
  const [orderNumber, setOrderNumber] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [result, setResult] = useState<Result | null>(null);

  // Fetch current order count on mount
  useEffect(() => {
    fetch('/api/order-count')
      .then((res) => res.json())
      .then((data) => setOrderNumber(data.count))
      .catch(() => setOrderNumber(0));
  }, []);

  const handleNameSubmit = async (submittedName: string) => {
    setName(submittedName);
    setStage('questions');
    
    // Get the actual order number from server (atomic increment)
    try {
      const res = await fetch('/api/order-count', { method: 'POST' });
      const data = await res.json();
      setOrderNumber(data.count);
    } catch {
      setOrderNumber((prev) => prev + 1);
    }
  };

  const handleOptionSelect = useCallback(
    (optionId: string, option: Option) => {
      const currentQuestion = questions[currentQuestionIndex];
      
      const newAnswer: Answer = {
        questionId: currentQuestion.id,
        optionId,
        optionText: option.text,
        optionDescription: option.description,
        restaurant: option.restaurant,
        weight: currentQuestion.weight,
      };

      const newAnswers = [...answers, newAnswer];
      setAnswers(newAnswers);

      // Auto-advance after a short delay
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
        } else {
          // All questions answered, generate result
          generateResult(newAnswers);
        }
      }, 300);
    },
    [currentQuestionIndex, answers]
  );

  const generateResult = async (finalAnswers: Answer[]) => {
    setStage('loading');
    
    const { winner, scores } = calculateResult(finalAnswers);
    
    try {
      const res = await fetch('/api/generate-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant: winner,
          answers: finalAnswers,
          name,
        }),
      });
      
      const data = await res.json();
      setResult({
        restaurant: data.restaurant,
        roast: data.roast,
        secretWeapon: data.secretWeapon,
        blurb: data.blurb,
        scores,
      });
      setStage('result');
    } catch (error) {
      console.error('Error generating result:', error);
      // Fallback
      setResult({
        restaurant: winner,
        roast: `You're a ${winner.toLowerCase()}-coded professional who navigates corporate life with suspicious efficiency.`,
        secretWeapon: 'An uncanny ability to always know where the good snacks are hidden.',
        blurb: 'Competent, mysterious, and hungry',
        scores,
      });
      setStage('result');
    }
  };

  const handleRestart = () => {
    setStage('intro');
    setName('');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setResult(null);
    
    // Refresh order count
    fetch('/api/order-count')
      .then((res) => res.json())
      .then((data) => setOrderNumber(data.count))
      .catch(() => {});
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md receipt-paper p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 
            onClick={handleRestart}
            className="text-2xl font-bold tracking-tight text-receipt-black mb-2 cursor-pointer hover:text-receipt-black/80 transition-colors"
          >
            CorporateSlopBowl.com
          </h1>
          {stage === 'intro' && (
            <>
              <LogoCarousel />
              <p className="text-sm text-receipt-black/60">
                Take the personality test to find out your slop bowl match.
              </p>
            </>
          )}
        </div>

        {/* Order Header (shown on loading and result only) */}
        {(stage === 'loading' || stage === 'result') && (
          <OrderHeader orderNumber={orderNumber} name={name} />
        )}

        {/* Intro Stage */}
        {stage === 'intro' && (
          <div className="fade-in">
            <div className="border-t border-receipt-gray pt-6 mb-6">
              <div className="flex justify-between items-center text-sm mb-4">
                <span className="text-receipt-black/60 uppercase tracking-wider">
                  Order #
                </span>
                <span className="font-bold text-receipt-black">
                  {String(orderNumber + 1).padStart(5, '0')}
                </span>
              </div>
            </div>
            <NameInput onSubmit={handleNameSubmit} />
          </div>
        )}

        {/* Questions Stage */}
        {stage === 'questions' && (
          <QuestionCard
            key={currentQuestionIndex}
            question={questions[currentQuestionIndex]}
            selectedOption={null}
            onSelect={handleOptionSelect}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
          />
        )}

        {/* Loading Stage */}
        {stage === 'loading' && <LoadingState />}

        {/* Result Stage */}
        {stage === 'result' && result && (
          <ResultCard
            restaurant={result.restaurant}
            roast={result.roast}
            secretWeapon={result.secretWeapon}
            blurb={result.blurb}
            scores={result.scores}
            name={name}
            orderNumber={orderNumber}
            onRestart={handleRestart}
          />
        )}

      </div>
    </main>
  );
}
