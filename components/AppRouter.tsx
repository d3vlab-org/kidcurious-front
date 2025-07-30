import React, { useState } from 'react';
import { useAge } from '../contexts/AgeContext';
import { useLanguage } from '../contexts/LanguageContext';

// Screen imports
import OnboardingScreen from './screens/OnboardingScreen';
import ProfileSwitcherScreen from './screens/ProfileSwitcherScreen';
import ChildHomeScreen from './screens/ChildHomeScreen';
import VoiceCaptureScreen from './screens/VoiceCaptureScreen';
import AnswerViewScreen from './screens/AnswerViewScreen';
import VideoSuggestionScreen from './screens/VideoSuggestionScreen';
import ParentDashboardScreen from './screens/ParentDashboardScreen';
import ChatScreen from './screens/ChatScreen';

export type Screen = 
  | 'onboarding'
  | 'profile-switcher' 
  | 'child-home'
  | 'voice-capture'
  | 'answer-view'
  | 'video-suggestion'
  | 'parent-dashboard'
  | 'chat';

interface AppRouterProps {
  initialScreen?: Screen;
}

export function AppRouter({ initialScreen = 'onboarding' }: AppRouterProps) {
  const [currentScreen, setCurrentScreen] = useState<Screen>(initialScreen);
  const [screenData, setScreenData] = useState<any>(null); // For passing data between screens
  const { currentChild } = useAge();

  const navigateTo = (screen: Screen, data?: any) => {
    setScreenData(data);
    setCurrentScreen(screen);
  };

  // If no child selected and not on profile switcher/onboarding, redirect
  if (!currentChild && currentScreen !== 'onboarding' && currentScreen !== 'profile-switcher') {
    setCurrentScreen('profile-switcher');
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'onboarding':
        return <OnboardingScreen onComplete={() => navigateTo('profile-switcher')} />;
      
      case 'profile-switcher':
        return <ProfileSwitcherScreen onChildSelected={() => navigateTo('child-home')} />;
      
      case 'child-home':
        return (
          <ChildHomeScreen 
            onAskQuestion={() => navigateTo('voice-capture')}
            onParentAccess={() => navigateTo('parent-dashboard')}
            onChat={() => navigateTo('chat')}
          />
        );
      
      case 'voice-capture':
        return (
          <VoiceCaptureScreen 
            onAnswerReceived={(answer) => navigateTo('answer-view', { answer })}
            onCancel={() => navigateTo('child-home')}
          />
        );
      
      case 'answer-view':
        return (
          <AnswerViewScreen 
            answer={screenData?.answer}
            onWatchVideo={() => navigateTo('video-suggestion', screenData)}
            onAskAnother={() => navigateTo('voice-capture')}
            onHome={() => navigateTo('child-home')}
          />
        );
      
      case 'video-suggestion':
        return (
          <VideoSuggestionScreen 
            question={screenData?.answer?.question}
            onBack={() => navigateTo('answer-view', screenData)}
            onHome={() => navigateTo('child-home')}
          />
        );
      
      case 'parent-dashboard':
        return (
          <ParentDashboardScreen 
            onBack={() => navigateTo('child-home')}
          />
        );
      
      case 'chat':
        return (
          <ChatScreen 
            onBack={() => navigateTo('child-home')}
            onHome={() => navigateTo('child-home')}
          />
        );
      
      default:
        return <OnboardingScreen onComplete={() => navigateTo('profile-switcher')} />;
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto h-screen bg-background overflow-hidden">
      <div className="w-full h-full relative">
        {renderScreen()}
      </div>
    </div>
  );
}