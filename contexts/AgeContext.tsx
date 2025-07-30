import React, { createContext, useContext, useState } from 'react';

interface ChildProfile {
  id: string;
  name: string;
  birthYear: number;
  avatar: string; // animal theme
  color: 'elephant' | 'flamingo' | 'giraffe' | 'frog' | 'whale';
}

type AgeGroup = 'pre-reader' | 'early-reader';

interface AgeContextType {
  currentChild: ChildProfile | null;
  setCurrentChild: (child: ChildProfile | null) => void;
  getAgeGroup: (birthYear: number) => AgeGroup;
  getCurrentAge: (birthYear: number) => number;
  children: ChildProfile[];
  setChildren: (children: ChildProfile[]) => void;
}

const AgeContext = createContext<AgeContextType | undefined>(undefined);

export function AgeProvider({ children }: { children: React.ReactNode }) {
  const [currentChild, setCurrentChild] = useState<ChildProfile | null>(null);
  const [childrenProfiles, setChildren] = useState<ChildProfile[]>([
    // Mock data for demo
    {
      id: '1',
      name: 'Zosia',
      birthYear: 2019, // 5-6 years old
      avatar: '🐘',
      color: 'elephant'
    },
    {
      id: '2', 
      name: 'Kacper',
      birthYear: 2016, // 8-9 years old
      avatar: '🦒',
      color: 'giraffe'
    }
  ]);

  const getCurrentAge = (birthYear: number): number => {
    return new Date().getFullYear() - birthYear;
  };

  const getAgeGroup = (birthYear: number): AgeGroup => {
    const age = getCurrentAge(birthYear);
    return age <= 6 ? 'pre-reader' : 'early-reader';
  };

  return (
    <AgeContext.Provider value={{
      currentChild,
      setCurrentChild,
      getAgeGroup,
      getCurrentAge,
      children: childrenProfiles,
      setChildren
    }}>
      {children}
    </AgeContext.Provider>
  );
}

export function useAge() {
  const context = useContext(AgeContext);
  if (!context) {
    throw new Error('useAge must be used within AgeProvider');
  }
  return context;
}