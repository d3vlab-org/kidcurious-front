import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'pl' | 'en';

interface Translations {
  // Common
  back: string;
  next: string;
  cancel: string;
  confirm: string;
  settings: string;
  
  // App name
  appName: string;
  
  // Child screens
  askQuestion: string;
  recentQuestions: string;
  listening: string;
  tapToSpeak: string;
  playAnswer: string;
  watchVideo: string;
  
  // Profile switcher
  chooseProfile: string;
  addChild: string;
  
  // Parent dashboard
  parentDashboard: string;
  inbox: string;
  history: string;
  filters: string;
  export: string;
  quietHours: string;
  deleteData: string;
  
  // Onboarding
  welcome: string;
  mission: string;
  privacy: string;
  micPermission: string;
  getStarted: string;
  
  // Age groups
  preReader: string;
  earlyReader: string;
  
  // Filters
  violence: string;
  inappropriate: string;
  politics: string;
  
  // Sample questions for different ages
  sampleQuestionsPreReader: string[];
  sampleQuestionsEarlyReader: string[];
}

const translations: Record<Language, Translations> = {
  pl: {
    // Common
    back: 'Wstecz',
    next: 'Dalej',
    cancel: 'Anuluj',
    confirm: 'Potwierdź',
    settings: 'Ustawienia',
    
    // App name
    appName: 'MądreKidAsk',
    
    // Child screens
    askQuestion: 'Zadaj pytanie',
    recentQuestions: 'Ostatnie pytania',
    listening: 'Słucham...',
    tapToSpeak: 'Dotknij aby mówić',
    playAnswer: 'Odtwórz odpowiedź',
    watchVideo: 'Obejrzyj film',
    
    // Profile switcher
    chooseProfile: 'Wybierz profil',
    addChild: 'Dodaj dziecko',
    
    // Parent dashboard
    parentDashboard: 'Panel rodzica',
    inbox: 'Skrzynka',
    history: 'Historia',
    filters: 'Filtry',
    export: 'Eksportuj',
    quietHours: 'Cicha godzina',
    deleteData: 'Usuń dane',
    
    // Onboarding
    welcome: 'Witaj!',
    mission: 'Bezpieczne odpowiedzi dla ciekawych dzieci',
    privacy: 'Twoja prywatność jest ważna',
    micPermission: 'Potrzebuję dostępu do mikrofonu',
    getStarted: 'Zacznijmy!',
    
    // Age groups
    preReader: 'Przedszkolak',
    earlyReader: 'Wczesny czytelnik',
    
    // Filters
    violence: 'Przemoc',
    inappropriate: 'Nieodpowiednie',
    politics: 'Polityka',
    
    // Sample questions
    sampleQuestionsPreReader: [
      'Dlaczego niebo jest niebieskie?',
      'Jak robi kawa miau?',
      'Czy rybki śpią?'
    ],
    sampleQuestionsEarlyReader: [
      'Jak działają rakiety kosmiczne?',
      'Dlaczego dinozaury wyginęły?',
      'Jak powstają tęcze?',
      'Czemu morze jest słone?'
    ]
  },
  en: {
    // Common
    back: 'Back',
    next: 'Next',
    cancel: 'Cancel',
    confirm: 'Confirm',
    settings: 'Settings',
    
    // App name
    appName: 'KidAsk Smart',
    
    // Child screens
    askQuestion: 'Ask a Question',
    recentQuestions: 'Recent Questions',
    listening: 'Listening...',
    tapToSpeak: 'Tap to Speak',
    playAnswer: 'Play Answer',
    watchVideo: 'Watch Video',
    
    // Profile switcher
    chooseProfile: 'Choose Profile',
    addChild: 'Add Child',
    
    // Parent dashboard
    parentDashboard: 'Parent Dashboard',
    inbox: 'Inbox',
    history: 'History',
    filters: 'Filters',
    export: 'Export',
    quietHours: 'Quiet Hours',
    deleteData: 'Delete Data',
    
    // Onboarding
    welcome: 'Welcome!',
    mission: 'Safe answers for curious kids',
    privacy: 'Your privacy matters',
    micPermission: 'We need microphone access',
    getStarted: 'Get Started!',
    
    // Age groups
    preReader: 'Pre-reader',
    earlyReader: 'Early Reader',
    
    // Filters
    violence: 'Violence',
    inappropriate: 'Inappropriate',
    politics: 'Politics',
    
    // Sample questions
    sampleQuestionsPreReader: [
      'Why is the sky blue?',
      'How do cats meow?',
      'Do fish sleep?'
    ],
    sampleQuestionsEarlyReader: [
      'How do rockets work?',
      'Why did dinosaurs disappear?',
      'How are rainbows made?',
      'Why is the ocean salty?'
    ]
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('pl'); // Polish default

  useEffect(() => {
    const saved = localStorage.getItem('kidask-language');
    if (saved && (saved === 'pl' || saved === 'en')) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('kidask-language', lang);
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage: handleSetLanguage,
      t: translations[language]
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}