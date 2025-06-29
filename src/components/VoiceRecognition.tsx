import React, { useState, useEffect } from 'react';
import { Mic, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceRecognitionProps {
  onTranscript: (text: string) => void;
  onSpeakResponse: (text: string) => void;
  disabled?: boolean;
}

export const VoiceRecognition: React.FC<VoiceRecognitionProps> = ({
  onTranscript,
  onSpeakResponse,
  disabled = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }

    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, [onTranscript]);

  const handleStartListening = () => {
    if (disabled || !recognition) return;
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleSpeak = (text: string) => {
    if (!speechSynthesis || disabled) return;
    
    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance("Voice synthesis test - click the microphone to start voice input");
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
      onSpeakResponse(text);
    }
  };

  const recognitionSupported = !!recognition;
  const speechSupported = !!speechSynthesis;

  if (!recognitionSupported && !speechSupported) {
    return (
      <div className="text-xs sm:text-sm text-gray-400 text-center p-2">
        Voice features not supported in this browser
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {recognitionSupported && (
        <div className="relative">
          <Button
            onClick={handleStartListening}
            disabled={disabled}
            size="icon"
            className={cn(
              "relative transition-all duration-200 w-8 h-8 sm:w-9 sm:h-9",
              isListening 
                ? "bg-red-500 hover:bg-red-600 text-white shadow-lg" 
                : "bg-white/10 hover:bg-white/20 text-white border-white/30"
            )}
            variant={isListening ? "default" : "outline"}
          >
            <Mic className="size-3 sm:size-4" />
          </Button>
          
          {/* Pulsing ring animation when listening */}
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
              <div className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse" />
            </>
          )}
        </div>
      )}
      
      {speechSupported && (
        <Button
          onClick={() => handleSpeak("Test speech")}
          disabled={disabled}
          variant="outline"
          size="icon"
          className={cn(
            "transition-all duration-200 w-8 h-8 sm:w-9 sm:h-9",
            isSpeaking 
              ? "bg-blue-500 hover:bg-blue-600 text-white animate-pulse" 
              : "bg-white/10 hover:bg-white/20 text-white border-white/30"
          )}
        >
          {isSpeaking ? <VolumeX className="size-3 sm:size-4" /> : <Volume2 className="size-3 sm:size-4" />}
        </Button>
      )}
      
      <div className="text-xs text-gray-400 min-w-[80px]">
        {isListening && (
          <span className="text-red-300 font-medium animate-pulse">
            🎤 Listening...
          </span>
        )}
        {isSpeaking && !isListening && (
          <span className="text-blue-300 font-medium">
            🔊 Speaking...
          </span>
        )}
        {!isListening && !isSpeaking && (
          <span>Voice ready</span>
        )}
      </div>
    </div>
  );
};