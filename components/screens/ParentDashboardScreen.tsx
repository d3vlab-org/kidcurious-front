import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ZooButton } from '../ZooButton';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { 
  ArrowLeft, 
  Inbox, 
  History, 
  Filter, 
  Settings, 
  Search, 
  Download, 
  Trash2, 
  AlertTriangle,
  Clock,
  Shield,
  Globe
} from 'lucide-react';

interface ParentDashboardScreenProps {
  onBack: () => void;
}

type DashboardTab = 'inbox' | 'history' | 'filters' | 'settings';

export default function ParentDashboardScreen({ onBack }: ParentDashboardScreenProps) {
  const { t, language, setLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<DashboardTab>('inbox');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const flaggedQuestions = [
    {
      id: '1',
      question: 'Dlaczego ludzie się biją?',
      child: 'Zosia',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      reason: 'Filtr: przemoc',
      status: 'pending'
    },
    {
      id: '2', 
      question: 'Co to znaczy brzydkie słowo?',
      child: 'Kacper',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      reason: 'Filtr: nieodpowiednie',
      status: 'reviewed'
    }
  ];

  const conversationHistory = [
    {
      id: '1',
      child: 'Zosia',
      question: 'Dlaczego niebo jest niebieskie?',
      answer: 'Niebo jest niebieskie, bo światło słońca...',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      approved: true
    },
    {
      id: '2',
      child: 'Kacper', 
      question: 'Jak działają rakiety?',
      answer: 'Rakiety działają jak bardzo potężne...',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      approved: true
    },
    {
      id: '3',
      child: 'Zosia',
      question: 'Czy rybki śpią?',
      answer: 'Tak, rybki też śpią, ale nie tak jak my...',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      approved: true
    }
  ];

  const TabButton = ({ tab, icon: Icon, label }: { tab: DashboardTab, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl transition-zoo ${
        activeTab === tab 
          ? 'bg-zoo-accent text-white' 
          : 'text-muted-foreground hover:text-primary hover:bg-muted'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  const InboxTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">{t.inbox}</h2>
        <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
          {flaggedQuestions.filter(q => q.status === 'pending').length} nowe
        </div>
      </div>

      {flaggedQuestions.length === 0 ? (
        <Card className="p-8 text-center">
          <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-primary mb-2">Brak flagowanych pytań</h3>
          <p className="text-muted-foreground">Wszystkie pytania przeszły przez filtry bezpieczeństwa.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {flaggedQuestions.map((item) => (
            <Card key={item.id} className="p-4 border-l-4 border-orange-400">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <span className="font-medium text-primary">{item.child}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.timestamp.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  item.status === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                }`}>
                  {item.status === 'pending' ? 'Oczekuje' : 'Sprawdzone'}
                </div>
              </div>

              <blockquote className="text-lg text-primary mb-2 pl-4 border-l-2 border-muted">
                "{item.question}"
              </blockquote>

              <p className="text-sm text-orange-600 mb-4">{item.reason}</p>

              {item.status === 'pending' && (
                <div className="flex gap-2">
                  <ZooButton size="sm" variant="secondary">Zezwól</ZooButton>
                  <ZooButton size="sm" variant="danger">Zablokuj</ZooButton>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const HistoryTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary">{t.history}</h2>
        <div className="flex items-center gap-2">
          <ZooButton size="sm" variant="secondary" icon={<Download />}>
            CSV
          </ZooButton>
          <ZooButton size="sm" variant="danger" icon={<Trash2 />}>
            Usuń wszystko
          </ZooButton>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Szukaj w historii..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {conversationHistory.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-primary">{item.child}</span>
                <span className="text-sm text-muted-foreground">
                  {item.timestamp.toLocaleDateString('pl-PL')} {item.timestamp.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className={`w-3 h-3 rounded-full ${item.approved ? 'bg-green-500' : 'bg-orange-500'}`} />
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Pytanie:</span>
                <p className="font-medium text-primary">{item.question}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Odpowiedź:</span>
                <p className="text-muted-foreground text-sm">{item.answer}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const FiltersTab = () => {
    const [filters, setFilters] = useState({
      violence: true,
      inappropriate: true,
      politics: true,
      adult: true,
      scary: false
    });

    const [customKeywords, setCustomKeywords] = useState('');

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-primary">{t.filters}</h2>

        <Card className="p-6">
          <h3 className="text-xl font-bold text-primary mb-4">Kategorie treści</h3>
          <div className="space-y-4">
            {[
              { key: 'violence', label: 'Przemoc i agresja', description: 'Blokuje pytania o bójki, wojny, krzywdzenie' },
              { key: 'inappropriate', label: 'Treści nieodpowiednie', description: 'Blokuje przekleństwa i niemoralne zachowania' },
              { key: 'politics', label: 'Polityka', description: 'Blokuje pytania o partie polityczne i kontrowersje' },
              { key: 'adult', label: 'Tematy dla dorosłych', description: 'Blokuje alkohol, narkotyki, seksualność' },
              { key: 'scary', label: 'Straszne treści', description: 'Blokuje duchy, potwory, horrory' }
            ].map((filter) => (
              <div key={filter.key} className="flex items-start justify-between py-3 border-b border-muted last:border-0">
                <div className="flex-1">
                  <h4 className="font-medium text-primary">{filter.label}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{filter.description}</p>
                </div>
                <Switch
                  checked={filters[filter.key as keyof typeof filters]}
                  onCheckedChange={(checked) => setFilters({ ...filters, [filter.key]: checked })}
                />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold text-primary mb-4">Niestandardowe słowa kluczowe</h3>
          <p className="text-muted-foreground mb-4">
            Dodaj własne słowa lub frazy, które chcesz blokować (oddziel przecinkami)
          </p>
          <Input
            placeholder="np. wojna, straszny film, czarne dziury..."
            value={customKeywords}
            onChange={(e) => setCustomKeywords(e.target.value)}
          />
        </Card>
      </div>
    );
  };

  const SettingsTab = () => {
    const [quietHours, setQuietHours] = useState({
      enabled: true,
      start: '20:00',
      end: '08:00'
    });

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-primary">{t.settings}</h2>

        <Card className="p-6">
          <h3 className="text-xl font-bold text-primary mb-4">Język aplikacji</h3>
          <div className="flex gap-3">
            <ZooButton
              variant={language === 'pl' ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setLanguage('pl')}
              icon={<Globe />}
            >
              Polski
            </ZooButton>
            <ZooButton
              variant={language === 'en' ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setLanguage('en')}
              icon={<Globe />}
            >
              English
            </ZooButton>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-primary">Cicha godzina</h3>
              <p className="text-muted-foreground">Zablokuj korzystanie z aplikacji w określonych godzinach</p>
            </div>
            <Switch
              checked={quietHours.enabled}
              onCheckedChange={(checked) => setQuietHours({ ...quietHours, enabled: checked })}
            />
          </div>

          {quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Od:</label>
                <Input
                  type="time"
                  value={quietHours.start}
                  onChange={(e) => setQuietHours({ ...quietHours, start: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Do:</label>
                <Input
                  type="time"
                  value={quietHours.end}
                  onChange={(e) => setQuietHours({ ...quietHours, end: e.target.value })}
                />
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold text-primary mb-4">Eksport danych</h3>
          <p className="text-muted-foreground mb-4">
            Pobierz historię rozmów i ustawienia aplikacji zgodnie z RODO
          </p>
          <ZooButton variant="secondary" size="md" icon={<Download />}>
            Pobierz wszystkie dane
          </ZooButton>
        </Card>

        <Card className="p-6 border-red-200">
          <h3 className="text-xl font-bold text-red-600 mb-4">Strefa niebezpieczna</h3>
          <p className="text-muted-foreground mb-4">
            Usuń wszystkie dane aplikacji. Tej operacji nie można cofnąć.
          </p>
          <ZooButton variant="danger" size="md" icon={<Trash2 />}>
            Usuń wszystkie dane
          </ZooButton>
        </Card>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'inbox': return <InboxTab />;
      case 'history': return <HistoryTab />;
      case 'filters': return <FiltersTab />;
      case 'settings': return <SettingsTab />;
      default: return <InboxTab />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-zoo-elephant to-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-white shadow-sm">
        <button
          onClick={onBack}
          className="p-2 rounded-xl text-muted-foreground hover:text-primary transition-zoo"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <h1 className="text-2xl font-bold text-primary">{t.parentDashboard}</h1>
        
        <div className="w-10" />
      </div>

      {/* Tab navigation */}
      <div className="px-6 py-4 bg-white border-b border-muted">
        <div className="flex gap-2">
          <TabButton tab="inbox" icon={Inbox} label={t.inbox} />
          <TabButton tab="history" icon={History} label={t.history} />
          <TabButton tab="filters" icon={Filter} label={t.filters} />
          <TabButton tab="settings" icon={Settings} label={t.settings} />
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  );
}