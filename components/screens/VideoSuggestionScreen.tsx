import React, { useState } from 'react';
import { useAge } from '../../contexts/AgeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ZooButton } from '../ZooButton';
import { Card } from '../ui/card';
import { ArrowLeft, Home, Play, ExternalLink, Shield } from 'lucide-react';

interface VideoSuggestionScreenProps {
  question: string;
  onBack: () => void;
  onHome: () => void;
}

export default function VideoSuggestionScreen({ question, onBack, onHome }: VideoSuggestionScreenProps) {
  const { currentChild, getAgeGroup } = useAge();
  const { t } = useLanguage();
  const [videoLoaded, setVideoLoaded] = useState(false);

  if (!currentChild) return null;

  const ageGroup = getAgeGroup(currentChild.birthYear);
  const isPreReader = ageGroup === 'pre-reader';

  // Mock video suggestions based on question
  const getVideoId = (question: string) => {
    if (question.toLowerCase().includes('rakiet') || question.toLowerCase().includes('rocket')) {
      return 'dQw4w9WgXcQ'; // Mock YouTube ID
    }
    if (question.toLowerCase().includes('niebo') || question.toLowerCase().includes('sky')) {
      return 'dQw4w9WgXcQ';
    }
    return 'dQw4w9WgXcQ'; // Default mock ID
  };

  const videoId = getVideoId(question);
  const videoTitle = isPreReader ? 
    'Film dla dzieci o tym, co cię interesuje!' :
    'Edukacyjny film na YouTube Kids';

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-zoo-whale to-white">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <button
          onClick={onBack}
          className="p-2 rounded-xl text-muted-foreground hover:text-primary transition-zoo"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <h1 className="text-xl font-bold text-primary">
          {isPreReader ? 'Film dla ciebie!' : t.watchVideo}
        </h1>
        
        <button
          onClick={onHome}
          className="p-2 rounded-xl text-muted-foreground hover:text-primary transition-zoo"
        >
          <Home className="w-6 h-6" />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Safety notice */}
        <Card className="p-4 bg-zoo-frog/20 border border-green-200">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-600" />
            <div className="flex-1">
              <p className={`text-green-800 ${isPreReader ? 'text-base' : 'text-lg'} font-medium`}>
                {isPreReader ? 
                  'Bezpieczny film dla dzieci' : 
                  'Film z YouTube Kids - treść sprawdzona dla dzieci'
                }
              </p>
            </div>
          </div>
        </Card>

        {/* Video player */}
        <Card className="overflow-hidden shadow-lg">
          <div className="aspect-video bg-gray-100 relative">
            {!videoLoaded ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zoo-whale to-zoo-elephant">
                <div className="text-6xl mb-4">📺</div>
                <h3 className={`text-center mb-4 font-bold text-primary ${isPreReader ? 'text-lg' : 'text-xl'}`}>
                  {videoTitle}
                </h3>
                <ZooButton
                  onClick={() => setVideoLoaded(true)}
                  size="md"
                  icon={<Play />}
                >
                  {isPreReader ? 'Odtwórz film' : 'Uruchom wideo'}
                </ZooButton>
              </div>
            ) : (
              <div className="w-full h-full">
                {/* Mock embedded video - in real app this would be YouTube Kids embed */}
                <div className="w-full h-full bg-black flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🎥</div>
                    <p>Mock YouTube Kids Video</p>
                    <p className="text-sm mt-2">Restricted mode: ON</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className={`font-bold text-primary mb-2 ${isPreReader ? 'text-lg' : 'text-xl'}`}>
              {question.includes('rakiet') ? 
                (isPreReader ? 'Jak latają rakiety?' : 'Jak działają rakiety kosmiczne?') :
                (isPreReader ? 'Ciekawy film dla ciebie' : 'Film edukacyjny na twój temat')
              }
            </h3>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-green-600" />
              <span>YouTube Kids • Bezpieczne dla dzieci</span>
            </div>
          </div>
        </Card>

        {/* Related suggestions */}
        <div>
          <h3 className={`font-bold text-primary mb-4 ${isPreReader ? 'text-lg' : 'text-xl'}`}>
            {isPreReader ? 'Inne ciekawe filmy' : 'Podobne filmy'}
          </h3>
          
          <div className="space-y-3">
            {[
              { title: isPreReader ? 'Dlaczego pada deszcz?' : 'Cykl wody w naturze', duration: '3:45' },
              { title: isPreReader ? 'Jak leci samolot?' : 'Fizyka lotu samolotów', duration: '5:12' },
              { title: isPreReader ? 'Co to są gwiazdy?' : 'Gwiazdy i galaktyki', duration: '4:30' }
            ].map((video, index) => (
              <Card key={index} className="p-4 cursor-pointer transition-zoo hover:scale-105 hover:shadow-lg border border-zoo-accent/20">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-12 bg-zoo-giraffe rounded-lg flex items-center justify-center text-xl">
                    🎬
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-primary">
                      {video.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {video.duration} • YouTube Kids
                    </p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-zoo-accent" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="p-6 space-y-3">
        <ZooButton
          onClick={onBack}
          variant="secondary"
          size="md"
          className="w-full"
        >
          {isPreReader ? 'Wróć do odpowiedzi' : 'Wróć do odpowiedzi'}
        </ZooButton>
      </div>
    </div>
  );
}