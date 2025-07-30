import React from 'react';
import { useAge } from '../../contexts/AgeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { AnimalAvatar } from '../AnimalAvatar';
import { ZooButton } from '../ZooButton';
import { Card } from '../ui/card';
import { Plus, Settings } from 'lucide-react';

interface ProfileSwitcherScreenProps {
  onChildSelected: () => void;
}

export default function ProfileSwitcherScreen({ onChildSelected }: ProfileSwitcherScreenProps) {
  const { children, setCurrentChild, getCurrentAge, getAgeGroup } = useAge();
  const { t } = useLanguage();

  const handleChildSelect = (child: any) => {
    setCurrentChild(child);
    onChildSelected();
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-zoo-giraffe to-white p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">
          {t.chooseProfile}
        </h1>
        <p className="text-muted-foreground">
          Wybierz, kto chce zadać pytanie
        </p>
      </div>

      {/* Children profiles */}
      <div className="flex-1 space-y-4">
        {children.map((child) => {
          const age = getCurrentAge(child.birthYear);
          const ageGroup = getAgeGroup(child.birthYear);
          
          return (
            <Card 
              key={child.id}
              className="p-6 cursor-pointer transition-zoo hover:scale-105 hover:shadow-lg border-2 hover:border-zoo-accent"
              onClick={() => handleChildSelect(child)}
            >
              <div className="flex items-center gap-4">
                <AnimalAvatar 
                  animal={child.color}
                  size="lg"
                />
                
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-primary">
                    {child.name}
                  </h3>
                  <p className="text-muted-foreground">
                    {age} {age === 1 ? 'rok' : age < 5 ? 'lata' : 'lat'} • {ageGroup === 'pre-reader' ? t.preReader : t.earlyReader}
                  </p>
                </div>

                <div className="text-4xl">
                  {child.avatar}
                </div>
              </div>
            </Card>
          );
        })}

        {/* Add child button */}
        <Card className="p-6 border-2 border-dashed border-muted-foreground/30 cursor-pointer transition-zoo hover:border-zoo-accent hover:bg-zoo-giraffe/20">
          <div className="flex items-center justify-center gap-4 text-muted-foreground hover:text-zoo-accent transition-zoo">
            <Plus className="w-8 h-8" />
            <span className="text-xl">{t.addChild}</span>
          </div>
        </Card>
      </div>

      {/* Bottom settings */}
      <div className="pt-4">
        <ZooButton
          variant="secondary"
          size="md"
          className="w-full"
          icon={<Settings />}
        >
          {t.settings}
        </ZooButton>
      </div>
    </div>
  );
}