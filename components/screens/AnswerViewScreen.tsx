import React, { useState } from 'react';
import { useAge } from '../../contexts/AgeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ZooButton } from '../ZooButton';
import { AnimalAvatar } from '../AnimalAvatar';
import { Card } from '../ui/card';
import { Play, Pause, Volume2, Home, Mic, ExternalLink, ArrowLeft } from 'lucide-react';

interface AnswerViewScreenProps {
  answer: {
    question: string;
    answer: string;
    videoSuggestion?: string;
    timestamp: Date;
  };
  onWatchVideo: () => void;
  onAskAnother: () => void;
  onHome: () => void;
}

export default function AnswerViewScreen({ answer, onWatchVideo, onAskAnother, onHome }: AnswerViewScreenProps) {
  const { currentChild, getAgeGroup } = useAge();
  const { t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);

  if (!currentChild || !answer) return null;

  const ageGroup = getAgeGroup(currentChild.birthYear);
  const isPreReader = ageGroup === 'pre-reader';

  const playAnswer = () => {
    setIsPlaying(true);
    
    // Mock TTS playback
    const utterance = new SpeechSynthesisUtterance(answer.answer);
    utterance.lang = 'pl-PL';
    utterance.rate = isPreReader ? 0.8 : 1.0; // Slower for pre-readers
    utterance.onend = () => setIsPlaying(false);
    
    speechSynthesis.speak(utterance);
  };

  const stopPlayback = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  // Generate a pastel animal illustration based on the question theme
  const getIllustrationAnimal = (question: string) => {
    if (question.toLowerCase().includes('niebo') || question.toLowerCase().includes('sky')) return '☁️';
    if (question.toLowerCase().includes('rakiet') || question.toLowerCase().includes('rocket')) return '🚀';
    if (question.toLowerCase().includes('dinozaur') || question.toLowerCase().includes('dinosaur')) return '🦕';
    if (question.toLowerCase().includes('tęcz') || question.toLowerCase().includes('rainbow')) return '🌈';
    return '⭐'; // default star
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-zoo-frog to-white">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <button
          onClick={onHome}
          className="p-2 rounded-xl text-muted-foreground hover:text-primary transition-zoo"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2">
          <AnimalAvatar animal={currentChild.color} size="sm" />
          <span className="font-medium text-primary">{currentChild.name}</span>
        </div>
        
        <button
          onClick={onHome}
          className="p-2 rounded-xl text-muted-foreground hover:text-primary transition-zoo"
        >
          <Home className="w-6 h-6" />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Question */}
        <Card className="p-6 bg-white/80 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="text-3xl">{currentChild.avatar}</div>
            <div className="flex-1">
              <p className={`font-medium text-primary ${isPreReader ? 'text-lg' : 'text-xl'}`}>
                {answer.question}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {answer.timestamp.toLocaleTimeString('pl-PL', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        </Card>

        {/* Hero illustration */}
        <div className="relative aspect-video bg-gradient-to-br from-zoo-giraffe to-zoo-flamingo rounded-2xl flex items-center justify-center overflow-hidden">
          <div className="text-8xl opacity-80">
            {getIllustrationAnimal(answer.question)}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
        </div>

        {/* Answer */}
        <Card className="p-6 bg-white shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <AnimalAvatar animal={currentChild.color} size="md" />
            <div className="flex-1">
              <p className={`text-primary leading-relaxed ${isPreReader ? 'text-lg' : 'text-xl'}`}>
                {answer.answer}
              </p>
            </div>
          </div>

          {/* TTS Controls */}
          <div className="flex justify-center">
            <ZooButton
              onClick={isPlaying ? stopPlayback : playAnswer}
              variant="secondary"
              size="md"
              icon={isPlaying ? <Pause /> : <Play />}
              className="flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              {isPlaying ? 'Zatrzymaj' : t.playAnswer}
            </ZooButton>
          </div>
        </Card>

        {/* Video suggestion */}
        {answer.videoSuggestion && (
          <Card className="p-6 bg-gradient-to-r from-zoo-whale to-zoo-elephant cursor-pointer transition-zoo hover:scale-105 hover:shadow-lg"
                onClick={onWatchVideo}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-2xl">
                📺
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-primary mb-1">
                  {isPreReader ? 'Zobacz film!' : t.watchVideo}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {answer.videoSuggestion}
                </p>
              </div>
              <ExternalLink className="w-6 h-6 text-zoo-accent" />
            </div>
          </Card>
        )}
      </div>

      {/* Bottom action */}
      <div className="p-6">
        <ZooButton
          onClick={onAskAnother}
          size="lg"
          className="w-full"
          icon={<Mic />}
        >
          {isPreReader ? 'Zadaj kolejne pytanie' : 'Zadaj inne pytanie'}
        </ZooButton>
      </div>
    </div>
  );
}