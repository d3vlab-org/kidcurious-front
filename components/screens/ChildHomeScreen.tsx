import React from 'react';
import { useAge } from '../../contexts/AgeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { AnimalAvatar } from '../AnimalAvatar';
import { ZooButton } from '../ZooButton';
import { Card } from '../ui/card';
import { Mic, Settings, Clock } from 'lucide-react';

interface ChildHomeScreenProps {
  onAskQuestion: () => void;
  onParentAccess: () => void;
}

export default function ChildHomeScreen({ onAskQuestion, onParentAccess }: ChildHomeScreenProps) {
  const { currentChild, getAgeGroup, getCurrentAge } = useAge();
  const { t } = useLanguage();

  if (!currentChild) return null;

  const ageGroup = getAgeGroup(currentChild.birthYear);
  const age = getCurrentAge(currentChild.birthYear);
  const isPreReader = ageGroup === 'pre-reader';

  // Mock recent questions based on age group
  const recentQuestions = isPreReader ? [
    { question: 'Dlaczego słońce świeci?', answer: 'Słońce to wielka gwiazda...', time: '2 min temu' },
    { question: 'Jak robią ptaki gniazda?', answer: 'Ptaki zbierają patyczki...', time: '1 godzina temu' }
  ] : [
    { question: 'Jak działają rakiety kosmiczne?', answer: 'Rakiety używają paliwa...', time: '30 min temu' },
    { question: 'Dlaczego dinozaury wyginęły?', answer: 'Naukowcy uważają, że...', time: '2 godziny temu' },
    { question: 'Jak powstają tęcze?', answer: 'Tęcza powstaje gdy...', time: 'wczoraj' }
  ];

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-zoo-flamingo to-white">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center gap-3">
          <AnimalAvatar animal={currentChild.color} size="md" />
          <div>
            <h2 className="text-xl font-bold text-primary">
              {isPreReader ? `Cześć ${currentChild.name}!` : `Witaj ${currentChild.name}!`}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isPreReader ? 'Co cię dzisiaj ciekawi?' : 'Jakie masz dzisiaj pytania?'}
            </p>
          </div>
        </div>

        <button
          onClick={onParentAccess}
          className="p-2 rounded-xl text-muted-foreground hover:text-primary transition-zoo"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Main microphone button */}
      <div className="flex-1 flex flex-col justify-center items-center px-6">
        <div className="relative mb-8">
          {/* Pulsing rings for animation */}
          <div className="absolute inset-0 rounded-full bg-zoo-accent/20 animate-ping"></div>
          <div className="absolute inset-2 rounded-full bg-zoo-accent/30 animate-pulse"></div>
          
          {/* Main button */}
          <ZooButton
            onClick={onAskQuestion}
            size="xl"
            className="w-40 h-40 rounded-full relative z-10"
            icon={<Mic className="w-12 h-12" />}
          >
            <div className="sr-only">{t.askQuestion}</div>
          </ZooButton>
        </div>

        <h1 className={`text-center mb-2 ${isPreReader ? 'text-2xl' : 'text-3xl'} font-bold text-primary`}>
          {t.tapToSpeak}
        </h1>
        
        {!isPreReader && (
          <p className="text-center text-muted-foreground px-4">
            Dotknij mikrofon i zadaj swoje pytanie głosowo
          </p>
        )}
      </div>

      {/* Recent questions carousel */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-zoo-accent" />
          <h3 className={`font-bold text-primary ${isPreReader ? 'text-lg' : 'text-xl'}`}>
            {t.recentQuestions}
          </h3>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {recentQuestions.map((item, index) => (
            <Card 
              key={index}
              className="min-w-64 p-4 cursor-pointer transition-zoo hover:scale-105 hover:shadow-lg border border-zoo-accent/20"
            >
              <div className="space-y-2">
                <p className={`font-medium text-primary ${isPreReader ? 'text-base line-clamp-2' : 'text-lg line-clamp-1'}`}>
                  {item.question}
                </p>
                {!isPreReader && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.answer}
                  </p>
                )}
                <p className="text-xs text-zoo-accent">
                  {item.time}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}