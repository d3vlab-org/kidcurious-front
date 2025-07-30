import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ZooButton } from '../ZooButton';
import { AnimalAvatar } from '../AnimalAvatar';
import { ChevronLeft, ChevronRight, Mic, Shield, Heart } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: <Heart className="w-16 h-16 text-zoo-accent" />,
      title: t.welcome,
      subtitle: t.mission,
      content: 'Bezpieczne i edukacyjne odpowiedzi dostosowane do wieku Twojego dziecka. Zadawaj pytania głosowo i otrzymuj odpowiedzi od przyjaznej AI.',
      animals: ['elephant', 'giraffe', 'whale'] as const
    },
    {
      icon: <Shield className="w-16 h-16 text-zoo-accent" />,
      title: t.privacy,
      subtitle: 'RODO i bezpieczeństwo',
      content: 'Wszystkie dane są szyfrowane i przechowywane bezpiecznie. Rodzice mają pełną kontrolę nad filtrowaniem treści i historią rozmów.',
      animals: ['frog', 'flamingo'] as const
    },
    {
      icon: <Mic className="w-16 h-16 text-zoo-accent" />,
      title: t.micPermission,
      subtitle: 'Pozwól na nagrywanie',
      content: 'Aby dziecko mogło zadawać pytania głosowo, potrzebujemy dostępu do mikrofonu. Nagrania są przetwarzane tylko w celu rozpoznania mowy.',
      animals: ['elephant', 'whale', 'giraffe', 'frog', 'flamingo'] as const
    }
  ];

  const currentSlideData = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      // Request microphone permission
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => onComplete())
        .catch(() => {
          // Still continue even if permission denied
          onComplete();
        });
    } else {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-zoo-whale to-white p-6">
      {/* Header with progress */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={handlePrev}
          disabled={currentSlide === 0}
          className="p-2 rounded-xl transition-zoo disabled:opacity-30"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-zoo ${
                index === currentSlide ? 'bg-zoo-accent' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center text-center">
        {/* Icon */}
        <div className="mb-8 p-6 rounded-3xl bg-white shadow-lg">
          {currentSlideData.icon}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-primary mb-4">
          {currentSlideData.title}
        </h1>

        {/* Subtitle */}
        <h2 className="text-xl text-zoo-accent mb-6">
          {currentSlideData.subtitle}
        </h2>

        {/* Content */}
        <p className="text-muted-foreground mb-8 px-4 leading-relaxed">
          {currentSlideData.content}
        </p>

        {/* Animal avatars */}
        <div className="flex gap-4 mb-8 flex-wrap justify-center">
          {currentSlideData.animals.map((animal, index) => (
            <AnimalAvatar 
              key={animal} 
              animal={animal} 
              size="md" 
              animated
              className="animate-pulse"
              style={{ 
                animationDelay: `${index * 200}ms`,
                animationDuration: '2s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom button */}
      <div className="pt-4">
        <ZooButton
          onClick={handleNext}
          size="lg"
          className="w-full"
          icon={isLastSlide ? <Mic /> : <ChevronRight />}
        >
          {isLastSlide ? t.getStarted : t.next}
        </ZooButton>
      </div>
    </div>
  );
}