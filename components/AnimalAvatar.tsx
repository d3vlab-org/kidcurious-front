import React from 'react';
import { cn } from './ui/utils';

interface AnimalAvatarProps {
  animal: 'elephant' | 'flamingo' | 'giraffe' | 'frog' | 'whale';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animated?: boolean;
}

const animalEmojis = {
  elephant: '🐘',
  flamingo: '🦩', 
  giraffe: '🦒',
  frog: '🐸',
  whale: '🐋'
};

const animalColors = {
  elephant: 'bg-zoo-elephant',
  flamingo: 'bg-zoo-flamingo',
  giraffe: 'bg-zoo-giraffe', 
  frog: 'bg-zoo-frog',
  whale: 'bg-zoo-whale'
};

export function AnimalAvatar({ 
  animal, 
  size = 'md', 
  className,
  animated = false 
}: AnimalAvatarProps) {
  const sizes = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-24 h-24 text-5xl',
    xl: 'w-32 h-32 text-7xl'
  };

  return (
    <div className={cn(
      'rounded-full flex items-center justify-center transition-zoo',
      animalColors[animal],
      sizes[size],
      animated && 'hover:scale-110 cursor-pointer',
      className
    )}>
      <span className="select-none">
        {animalEmojis[animal]}
      </span>
    </div>
  );
}