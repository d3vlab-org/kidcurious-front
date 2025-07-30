import React, { useState, useEffect } from 'react';
import { useAge } from '../../contexts/AgeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ZooButton } from '../ZooButton';
import { AnimalAvatar } from '../AnimalAvatar';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { kidAskAPI } from '../../services/api';
import { Mic, MicOff, X, Check, AlertTriangle, Keyboard, Settings } from 'lucide-react';

interface VoiceCaptureScreenProps {
  onAnswerReceived: (answer: any) => void;
  onCancel: () => void;
}

type PermissionState = 'unknown' | 'granted' | 'denied' | 'checking';

export default function VoiceCaptureScreen({ onAnswerReceived, onCancel }: VoiceCaptureScreenProps) {
  const { currentChild, getAgeGroup, getCurrentAge } = useAge();
  const { t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordedText, setRecordedText] = useState('');
  const [typedText, setTypedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>('unknown');
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');

  if (!currentChild) return null;

  const ageGroup = getAgeGroup(currentChild.birthYear);
  const isPreReader = ageGroup === 'pre-reader';
  const childAge = getCurrentAge(currentChild.birthYear);

  // Check microphone permission status
  useEffect(() => {
    const checkPermission = async () => {
      try {
        if ('permissions' in navigator) {
          const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setPermissionState(permission.state === 'granted' ? 'granted' : permission.state === 'denied' ? 'denied' : 'unknown');
          
          permission.onchange = () => {
            setPermissionState(permission.state === 'granted' ? 'granted' : permission.state === 'denied' ? 'denied' : 'unknown');
          };
        }
      } catch (error) {
        console.log('Permission API not supported');
        setPermissionState('unknown');
      }
    };

    checkPermission();
  }, []);

  // Mock audio level animation
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isRecording]);

  const requestMicrophonePermission = async () => {
    setPermissionState('checking');
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      // Permission granted - clean up the stream
      stream.getTracks().forEach(track => track.stop());
      setPermissionState('granted');
      
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setPermissionState('denied');
      setError('Dostęp do mikrofonu został odrzucony. Możesz wpisać pytanie tekstowo lub włączyć mikrofon w ustawieniach przeglądarki.');
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      
      // If permission is denied, don't try again
      if (permissionState === 'denied') {
        setError('Dostęp do mikrofonu został odrzucony. Użyj opcji wpisywania tekstu lub włącz mikrofon w ustawieniach.');
        return;
      }
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      setPermissionState('granted');
      
      // Create MediaRecorder
      const recorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        
        // For demo purposes, we'll use mock transcription
        // In production, you'd send audioBlob to a speech-to-text service
        const mockTranscription = isPreReader ? 
          'Dlaczego niebo jest niebieskie?' : 
          'Jak działają rakiety kosmiczne?';
        
        setRecordedText(mockTranscription);
        
        // Cleanup
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      setIsRecording(true);
      recorder.start();
      
      // Auto-stop after 10 seconds for demo
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          setIsRecording(false);
        }
      }, 10000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setPermissionState('denied');
      
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          setError('Dostęp do mikrofonu został odrzucony. Możesz wpisać pytanie tekstowo lub włączyć mikrofon w ustawieniach przeglądarki.');
        } else if (error.name === 'NotFoundError') {
          setError('Nie znaleziono mikrofonu. Sprawdź, czy mikrofon jest podłączony.');
        } else {
          setError('Nie można uruchomić mikrofonu. Spróbuj wpisać pytanie tekstowo.');
        }
      } else {
        setError('Wystąpił problem z mikrofonem. Użyj opcji wpisywania tekstu.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleTextSubmit = () => {
    if (typedText.trim()) {
      setRecordedText(typedText.trim());
      setTypedText('');
    }
  };

  const confirmQuestion = async () => {
    const questionText = recordedText || typedText.trim();
    if (!questionText || !currentChild) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await kidAskAPI.processQuestion({
        question: questionText,
        childId: currentChild.id,
        childAge
      });

      if (response.flagged) {
        // Question was flagged for parent review
        setError(response.message || 'Pytanie zostało wysłane do rodzica do sprawdzenia.');
        setIsProcessing(false);
        return;
      }

      if (response.success && response.answer) {
        const answerData = {
          question: questionText,
          answer: response.answer,
          videoSuggestion: response.videoSuggestion,
          timestamp: new Date(),
          conversationId: response.conversationId
        };
        
        onAnswerReceived(answerData);
      } else {
        throw new Error('Nie otrzymano odpowiedzi z serwera');
      }
      
    } catch (error) {
      console.error('Error processing question:', error);
      setError('Wystąpił problem z przetworzeniem pytania. Spróbuj ponownie.');
      setIsProcessing(false);
    }
  };

  const retryInput = () => {
    setRecordedText('');
    setTypedText('');
    setError(null);
  };

  const WaveformBars = () => (
    <div className="flex items-center justify-center gap-1 h-20">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="w-1 bg-zoo-accent rounded-full transition-all duration-100"
          style={{
            height: isRecording 
              ? `${10 + (audioLevel + i * 5) % 50}px`
              : '4px'
          }}
        />
      ))}
    </div>
  );

  const PermissionPrompt = () => (
    <Card className="p-6 bg-blue-50 border-blue-200">
      <div className="text-center space-y-4">
        <Mic className="w-12 h-12 text-blue-600 mx-auto" />
        <h3 className="text-xl font-bold text-blue-900">
          {isPreReader ? 'Potrzebuję mikrofonu' : 'Dostęp do mikrofonu'}
        </h3>
        <p className="text-blue-800">
          {isPreReader ? 
            'Żeby mówić do aplikacji, muszę słyszeć twój głos!' :
            'Aby nagrywać twoje pytania, potrzebuję dostępu do mikrofonu.'
          }
        </p>
        <ZooButton
          onClick={requestMicrophonePermission}
          size="md"
          disabled={permissionState === 'checking'}
          icon={<Mic />}
        >
          {permissionState === 'checking' ? 'Sprawdzam...' : 'Włącz mikrofon'}
        </ZooButton>
      </div>
    </Card>
  );

  const PermissionDeniedPrompt = () => (
    <Card className="p-6 bg-orange-50 border-orange-200">
      <div className="text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-orange-600 mx-auto" />
        <h3 className="text-xl font-bold text-orange-900">
          Mikrofon niedostępny
        </h3>
        <p className="text-orange-800 text-sm">
          Aby włączyć mikrofon:
        </p>
        <div className="text-left bg-white p-4 rounded-lg text-sm text-orange-800 space-y-2">
          <p>1. Kliknij ikonę 🔒 lub 🛡️ w pasku adresu</p>
          <p>2. Wybierz "Zezwól" przy mikrofonie</p>
          <p>3. Odśwież stronę</p>
        </div>
        
        <div className="flex gap-3 justify-center">
          <ZooButton
            onClick={() => window.location.reload()}
            variant="secondary"
            size="sm"
            icon={<Settings />}
          >
            Odśwież
          </ZooButton>
          <ZooButton
            onClick={() => setInputMode('text')}
            size="sm"
            icon={<Keyboard />}
          >
            Wpisz tekst
          </ZooButton>
        </div>
      </div>
    </Card>
  );

  if (isProcessing) {
    return (
      <div className="h-full flex flex-col justify-center items-center bg-gradient-to-b from-zoo-whale to-white p-6">
        <AnimalAvatar 
          animal={currentChild.color} 
          size="xl" 
          className="mb-8 animate-pulse" 
        />
        <h2 className="text-2xl font-bold text-primary mb-4 text-center">
          {isPreReader ? 'Myślę...' : 'Przygotowuję odpowiedź...'}
        </h2>
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-zoo-accent rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
        <p className="text-center text-muted-foreground mt-4 px-4">
          {isPreReader ? 
            'Przygotowuję dla ciebie odpowiedź...' :
            'AI analizuje twoje pytanie i przygotowuje odpowiedź na właściwym poziomie...'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-zoo-whale to-white">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <button
          onClick={onCancel}
          className="p-2 rounded-xl text-muted-foreground hover:text-primary transition-zoo"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2">
          <AnimalAvatar animal={currentChild.color} size="sm" />
          <span className="font-medium text-primary">{currentChild.name}</span>
        </div>
        
        {/* Input mode toggle */}
        <div className="flex gap-1 bg-white rounded-lg p-1">
          <button
            onClick={() => setInputMode('voice')}
            className={`p-2 rounded transition-zoo ${
              inputMode === 'voice' ? 'bg-zoo-accent text-white' : 'text-muted-foreground'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            onClick={() => setInputMode('text')}
            className={`p-2 rounded transition-zoo ${
              inputMode === 'text' ? 'bg-zoo-accent text-white' : 'text-muted-foreground'
            }`}
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center items-center px-6">
        {/* Title */}
        <h1 className={`text-center mb-8 ${isPreReader ? 'text-2xl' : 'text-3xl'} font-bold text-primary`}>
          {error ? 'Ups!' :
           inputMode === 'text' ? (isPreReader ? 'Wpisz pytanie' : 'Napisz swoje pytanie') :
           isRecording ? t.listening : 
           recordedText ? 'Sprawdź pytanie' : 
           t.tapToSpeak}
        </h1>

        {/* Error display */}
        {error && (
          <div className="bg-orange-100 border border-orange-300 rounded-2xl p-6 mb-8 w-full">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <h3 className="font-bold text-orange-800">Informacja</h3>
            </div>
            <p className="text-orange-700 mb-4">{error}</p>
            {permissionState === 'denied' && (
              <ZooButton
                onClick={() => setInputMode('text')}
                size="sm"
                variant="secondary"
                icon={<Keyboard />}
              >
                Wpisz pytanie tekstowo
              </ZooButton>
            )}
          </div>
        )}

        {/* Voice input mode */}
        {inputMode === 'voice' && !error && (
          <>
            {/* Permission handling */}
            {permissionState === 'unknown' && <PermissionPrompt />}
            {permissionState === 'denied' && <PermissionDeniedPrompt />}
            
            {/* Recording interface */}
            {permissionState === 'granted' && (
              <div className="mb-8">
                {isRecording ? (
                  <div className="bg-white rounded-3xl p-6 shadow-lg">
                    <WaveformBars />
                  </div>
                ) : (
                  <div className="relative">
                    {isRecording && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping"></div>
                        <div className="absolute inset-2 rounded-full bg-red-500/30 animate-pulse"></div>
                      </>
                    )}
                    
                    <ZooButton
                      onClick={isRecording ? stopRecording : startRecording}
                      size="xl"
                      variant={isRecording ? 'danger' : 'primary'}
                      className="w-32 h-32 rounded-full relative z-10"
                      icon={isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
                      disabled={!!recordedText}
                    >
                      <div className="sr-only">
                        {isRecording ? 'Nagrywanie...' : 'Naciśnij aby nagrać'}
                      </div>
                    </ZooButton>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Text input mode */}
        {inputMode === 'text' && !recordedText && (
          <div className="w-full space-y-4">
            <Input
              value={typedText}
              onChange={(e) => setTypedText(e.target.value)}
              placeholder={isPreReader ? "Co chcesz wiedzieć?" : "Wpisz swoje pytanie..."}
              className="text-lg p-4 rounded-2xl border-2 border-zoo-accent/30 focus:border-zoo-accent"
              onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
            />
            
            {/* Sample questions for inspiration */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                {isPreReader ? 'Możesz zapytać na przykład:' : 'Przykładowe pytania:'}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {(isPreReader ? [
                  'Dlaczego niebo jest niebieskie?',
                  'Jak robią koty miau?',
                  'Czy rybki śpią?'
                ] : [
                  'Jak działają rakiety?',
                  'Dlaczego dinozaury wyginęły?',
                  'Jak powstają tęcze?'
                ]).map((sample) => (
                  <button
                    key={sample}
                    onClick={() => setTypedText(sample)}
                    className="text-xs bg-zoo-giraffe hover:bg-zoo-accent hover:text-white px-3 py-1 rounded-full transition-zoo"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Question display */}
        {recordedText && (
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8 w-full">
            <p className={`text-center text-primary ${isPreReader ? 'text-lg' : 'text-xl'} font-medium`}>
              "{recordedText}"
            </p>
          </div>
        )}

        {/* Instructions */}
        {!recordedText && !isRecording && !error && inputMode === 'voice' && permissionState === 'granted' && (
          <p className="text-center text-muted-foreground px-4">
            {isPreReader 
              ? 'Dotknij mikrofon i powiedz, co chcesz wiedzieć' 
              : 'Naciśnij mikrofon i zadaj swoje pytanie. Mów wyraźnie i spokojnie.'
            }
          </p>
        )}
      </div>

      {/* Bottom buttons */}
      {(recordedText || (inputMode === 'text' && typedText.trim())) && !error && (
        <div className="p-6 space-y-3">
          <ZooButton
            onClick={inputMode === 'text' && !recordedText ? handleTextSubmit : confirmQuestion}
            size="lg"
            className="w-full"
            icon={<Check />}
          >
            {inputMode === 'text' && !recordedText ? 
              (isPreReader ? 'Zadaj pytanie' : 'Wyślij pytanie') :
              (isPreReader ? 'Wyślij' : t.confirm)
            }
          </ZooButton>
          
          <ZooButton
            onClick={retryInput}
            variant="secondary"
            size="md"
            className="w-full"
          >
            {isPreReader ? 'Zacznij od nowa' : 'Spróbuj ponownie'}
          </ZooButton>
        </div>
      )}

      {/* Error recovery buttons */}
      {error && (
        <div className="p-6 space-y-3">
          <ZooButton
            onClick={retryInput}
            size="lg"
            className="w-full"
            icon={inputMode === 'voice' ? <Mic /> : <Keyboard />}
          >
            Spróbuj ponownie
          </ZooButton>
          
          <ZooButton
            onClick={onCancel}
            variant="secondary"
            size="md"
            className="w-full"
          >
            Wróć do głównej
          </ZooButton>
        </div>
      )}
    </div>
  );
}