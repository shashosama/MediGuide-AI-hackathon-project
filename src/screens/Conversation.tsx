import React, { useState, useCallback, useEffect, useRef } from "react";
import { DialogWrapper } from "@/components/layout/DialogWrapper";
import {
  DailyAudio,
  useDaily,
  useLocalSessionId,
  useParticipantIds,
  useVideoTrack,
  useAudioTrack,
} from "@daily-co/daily-react";
import Video from "@/components/Video";
import { Button } from "@/components/ui/button";
import { endConversation } from "@/services/api";
import { apiTokenAtom } from "@/store/tokens";
import { conversationAtom } from "@/store/conversation";
import { screenAtom } from "@/store/screens";
import { useAtom, useAtomValue } from "jotai";
import { cn } from "@/lib/utils";
import {
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  PhoneIcon,
  MessageCircle,
  X,
  Send,
  Shield,
  ShieldCheck,
  AlertTriangle,
  AudioLines,
  AudioWaveform,
} from "lucide-react";
import { maskDetector, MaskDetectionResult, isContagiousSymptom } from "@/utils/maskDetection";
import { MaskDetectionOverlay } from "@/components/MaskDetectionOverlay";

export const Conversation: React.FC = () => {
  const [conversation, setConversation] = useAtom(conversationAtom);
  const [, setScreenState] = useAtom(screenAtom);
  const token = useAtomValue(apiTokenAtom);

  const daily = useDaily();
  const localSessionId = useLocalSessionId();
  const localVideo = useVideoTrack(localSessionId);
  const localAudio = useAudioTrack(localSessionId);
  const remoteParticipantIds = useParticipantIds({ filter: "remote" });

  const isCameraEnabled = !localVideo.isOff;
  const isMicEnabled = !localAudio.isOff;

  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const [isJoining, setIsJoining] = useState(true);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [showTextChat, setShowTextChat] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [maskResult, setMaskResult] = useState<MaskDetectionResult | null>(null);
  const [showMaskWarning, setShowMaskWarning] = useState(false);
  const [hasContagiousSymptoms, setHasContagiousSymptoms] = useState(false);
  const [isCallJoined, setIsCallJoined] = useState(false);
  const [maskDetectionActive, setMaskDetectionActive] = useState(false);
  const [speechErrorOccurred, setSpeechErrorOccurred] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const maskDetectionInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }

        if (finalTranscript) {
          // Clear speech error flag on successful transcription
          setSpeechErrorOccurred(false);
          
          setMessages(prev => [...prev, `Patient: ${finalTranscript}`]);
          
          // Check for contagious symptoms
          if (isContagiousSymptom(finalTranscript)) {
            setHasContagiousSymptoms(true);
            setShowMaskWarning(true);
          }
          
          // Send to Tavus CVI only if call is joined
          if (daily && isCallJoined) {
            daily.sendAppMessage({
              event_type: "conversation.text_input",
              text: finalTranscript
            });
          }
        }

        setTranscript(finalTranscript + interimTranscript);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        // Set error flag specifically for 'no-speech' errors
        if (event.error === 'no-speech') {
          setSpeechErrorOccurred(true);
        }
        
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [daily, isCallJoined]);

  // Initialize mask detection immediately
  useEffect(() => {
    const initMaskDetection = async () => {
      try {
        console.log('Initializing mask detection...');
        setMaskDetectionActive(true);
        await maskDetector.loadModel();
        console.log('Mask detection ready!');
      } catch (error) {
        console.error('Failed to initialize mask detection:', error);
      }
    };

    initMaskDetection();

    return () => {
      if (maskDetectionInterval.current) {
        clearInterval(maskDetectionInterval.current);
      }
      maskDetector.dispose();
    };
  }, []);

  // Start mask detection as soon as camera is available
  useEffect(() => {
    if (localSessionId && isCameraEnabled && maskDetectionActive) {
      console.log('Starting mask detection for local video...');
      
      // Start checking for video element immediately
      const checkForVideo = () => {
        const videoElement = document.querySelector(`video[data-session-id="${localSessionId}"]`) as HTMLVideoElement;
        
        if (videoElement && videoElement.videoWidth > 0) {
          console.log('Video element found, starting mask detection');
          localVideoRef.current = videoElement;
          startMaskDetection();
          return true;
        }
        return false;
      };

      // Try to find video element immediately
      if (!checkForVideo()) {
        // If not found, keep checking every 100ms
        const videoCheckInterval = setInterval(() => {
          if (checkForVideo()) {
            clearInterval(videoCheckInterval);
          }
        }, 100);

        // Clean up after 10 seconds if video not found
        setTimeout(() => {
          clearInterval(videoCheckInterval);
        }, 10000);
      }
    }

    return () => {
      if (maskDetectionInterval.current) {
        clearInterval(maskDetectionInterval.current);
      }
    };
  }, [localSessionId, isCameraEnabled, maskDetectionActive]);

  const startMaskDetection = () => {
    if (maskDetectionInterval.current) {
      clearInterval(maskDetectionInterval.current);
    }
    
    console.log('Starting mask detection interval...');
    
    // Run detection immediately
    performMaskDetection();
    
    // Then run every 2 seconds for fast updates
    maskDetectionInterval.current = setInterval(() => {
      performMaskDetection();
    }, 2000);
  };

  const performMaskDetection = async () => {
    if (localVideoRef.current && localVideoRef.current.videoWidth > 0) {
      try {
        const result = await maskDetector.detectMask(localVideoRef.current);
        console.log('Mask detection result:', result);
        setMaskResult(result);
        
        // Show warning if no mask detected and user has contagious symptoms
        if (!result.hasMask && hasContagiousSymptoms) {
          setShowMaskWarning(true);
        }
      } catch (error) {
        console.error('Mask detection error:', error);
      }
    }
  };

  // Join video room
  useEffect(() => {
    if (conversation?.conversation_url && daily && isJoining) {
      console.log("Joining conversation:", conversation.conversation_url);
      
      daily.join({
        url: conversation.conversation_url,
        startVideoOff: false,
        startAudioOff: false,
      }).then(() => {
        console.log("Successfully joined conversation");
        setIsJoining(false);
        setJoinError(null);
        setIsCallJoined(true);
        
        // Set initial media state
        daily.setLocalVideo(true);
        daily.setLocalAudio(true);
        
        // Start speech recognition automatically after greeting only if no error occurred
        setTimeout(() => {
          if (recognition && !isListening && !speechErrorOccurred) {
            try {
              recognition.start();
              setIsListening(true);
            } catch (error) {
              console.error('Failed to start speech recognition:', error);
            }
          }
        }, 3000); // Wait 3 seconds after joining
        
      }).catch((error) => {
        console.error("Failed to join conversation:", error);
        setJoinError("Failed to join video session. Please try again.");
        setIsJoining(false);
      });
    }
  }, [conversation?.conversation_url, daily, isJoining, recognition, speechErrorOccurred]);

  // Handle Tavus events
  useEffect(() => {
    if (!daily) return;

    const handleAppMessage = (msg: any) => {
      console.log("Received app message:", msg);
      
      if (msg?.data?.event_type === "conversation.utterance") {
        // AI is speaking - pause speech recognition temporarily
        if (recognition && isListening) {
          recognition.stop();
          setTimeout(() => {
            // Only restart if no speech error occurred
            if (recognition && !isListening && !speechErrorOccurred) {
              try {
                recognition.start();
                setIsListening(true);
              } catch (error) {
                console.error('Failed to restart speech recognition:', error);
              }
            }
          }, 2000);
        }
      }
      
      if (msg?.data?.event_type === "conversation.tool_call") {
        try {
          const result = handleDiagnoseSymptom(msg.data.parameters?.symptom || '');
          console.log("Tool call result:", result);
          
          if (result) {
            const responseText = `Based on the symptoms described, I recommend visiting the ${result.department}. They are located on the ${result.floor}.`;
            setMessages(prev => [...prev, `Medical Assistant: ${responseText}`]);
            
            // Send response back to Tavus CVI only if call is joined
            if (isCallJoined) {
              daily.sendAppMessage({
                event_type: "conversation.text_respond",
                text: responseText
              });
            }
          }
        } catch (error) {
          console.error("Tool call error:", error);
          const errorResponse = "I apologize, but I'm having trouble processing the request. Could the symptoms be described again?";
          setMessages(prev => [...prev, `Medical Assistant: ${errorResponse}`]);
          
          // Send error response only if call is joined
          if (isCallJoined) {
            daily.sendAppMessage({
              event_type: "conversation.text_respond",
              text: errorResponse
            });
          }
        }
      }
    };

    daily.on("app-message", handleAppMessage);

    return () => {
      daily.off("app-message", handleAppMessage);
    };
  }, [daily, recognition, isListening, isCallJoined, speechErrorOccurred]);

  const handleDiagnoseSymptom = (symptom: string) => {
    const symptomLower = symptom.toLowerCase();
    
    const mapping: { [key: string]: { department: string; floor: string } } = {
      "chest pain": { department: "Cardiology", floor: "Third Floor" },
      "heart pain": { department: "Cardiology", floor: "Third Floor" },
      "shortness of breath": { department: "Pulmonology", floor: "Second Floor" },
      "difficulty breathing": { department: "Pulmonology", floor: "Second Floor" },
      "rash": { department: "Dermatology", floor: "Fourth Floor" },
      "skin irritation": { department: "Dermatology", floor: "Fourth Floor" },
      "headache": { department: "Neurology", floor: "Fifth Floor" },
      "migraine": { department: "Neurology", floor: "Fifth Floor" },
      "back pain": { department: "Orthopedics", floor: "Sixth Floor" },
      "joint pain": { department: "Orthopedics", floor: "Sixth Floor" },
      "stomach pain": { department: "Gastroenterology", floor: "Third Floor" },
      "nausea": { department: "Gastroenterology", floor: "Third Floor" },
      "fever": { department: "General Medicine", floor: "First Floor" },
    };

    for (const [keyword, result] of Object.entries(mapping)) {
      if (symptomLower.includes(keyword)) {
        return result;
      }
    }

    return { department: "General Medicine", floor: "First Floor" };
  };

  const toggleSpeechRecognition = () => {
    if (!recognition) return;
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      // Clear error flag when user manually toggles speech recognition
      setSpeechErrorOccurred(false);
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
      }
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, `Patient: ${input}`]);
    
    // Check for contagious symptoms
    if (isContagiousSymptom(input)) {
      setHasContagiousSymptoms(true);
      setShowMaskWarning(true);
    }
    
    // Send message to Tavus CVI only if call is joined
    if (daily && isCallJoined) {
      daily.sendAppMessage({
        event_type: "conversation.text_input",
        text: input
      });
    }
    
    setInput("");
  };

  const toggleVideo = useCallback(() => {
    if (daily) {
      daily.setLocalVideo(!isCameraEnabled);
    }
  }, [daily, isCameraEnabled]);

  const toggleAudio = useCallback(() => {
    if (daily) {
      daily.setLocalAudio(!isMicEnabled);
    }
  }, [daily, isMicEnabled]);

  const toggleTextChat = useCallback(() => {
    setShowTextChat(prev => !prev);
  }, []);

  const leaveConversation = useCallback(async () => {
    try {
      if (recognition && isListening) {
        recognition.stop();
      }
      
      if (maskDetectionInterval.current) {
        clearInterval(maskDetectionInterval.current);
      }
      
      if (daily) {
        await daily.leave();
        daily.destroy();
      }
      
      if (conversation?.conversation_id && token) {
        await endConversation(token, conversation.conversation_id);
      }
    } catch (error) {
      console.error("Error ending conversation:", error);
    } finally {
      setConversation(null);
      setScreenState({ currentScreen: "finalScreen" });
    }
  }, [daily, token, conversation, setConversation, setScreenState, recognition, isListening]);

  // Show error state if join failed
  if (joinError) {
    return (
      <DialogWrapper>
        <div className="flex flex-col items-center justify-center h-full p-4 sm:p-8">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">Connection Failed</h2>
            <p className="text-slate-600 mb-6 text-sm sm:text-base">{joinError}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => {
                  setJoinError(null);
                  setIsJoining(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Try Again
              </Button>
              <Button
                onClick={() => setScreenState({ currentScreen: "instructions" })}
                variant="outline"
                className="text-slate-800 border-slate-300 hover:bg-slate-50"
              >
                Back to Menu
              </Button>
            </div>
          </div>
        </div>
      </DialogWrapper>
    );
  }

  // Show loading state while joining
  if (isJoining) {
    return (
      <DialogWrapper>
        <div className="flex flex-col items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-800 text-base sm:text-lg">Connecting to video session...</p>
          <p className="text-slate-600 text-sm mt-2">Please wait while we establish the connection</p>
        </div>
      </DialogWrapper>
    );
  }

  return (
    <DialogWrapper>
      <div className="h-full flex flex-col relative overflow-hidden">
        {/* Main Content Area - Properly constrained */}
        <div className="flex-1 flex flex-col lg:flex-row gap-3 p-3 min-h-0 overflow-hidden">
          {/* VIDEO AREA - Responsive and properly sized */}
          <div className={cn(
            "relative overflow-hidden rounded-lg border-2 border-blue-300 shadow-lg bg-slate-100",
            "transition-all duration-300 ease-in-out",
            showTextChat 
              ? "w-full lg:w-2/3 h-[280px] sm:h-[320px] lg:h-full" 
              : "w-full h-[350px] sm:h-[420px] md:h-[480px] lg:h-full"
          )}>
            {/* Remote participant video */}
            {remoteParticipantIds[0] && (
              <Video
                id={remoteParticipantIds[0]}
                className="absolute inset-0 w-full h-full"
                tileClassName="!object-cover w-full h-full"
              />
            )}
            
            {/* Local participant video (picture-in-picture) - Better positioned */}
            {localSessionId && (
              <div className="absolute bottom-3 right-3 z-20">
                <div className="relative border-2 border-blue-400 rounded-lg shadow-lg overflow-hidden bg-black">
                  <Video
                    id={localSessionId}
                    className="w-20 h-15 sm:w-24 sm:h-18 md:w-28 md:h-21"
                    tileClassName="!object-cover w-full h-full"
                  />
                </div>
              </div>
            )}
            
            {/* Mask Detection Overlay - Top right corner - ALWAYS VISIBLE */}
            <div className="absolute top-3 right-3 z-30">
              <MaskDetectionOverlay
                maskResult={maskResult}
                showMaskWarning={showMaskWarning}
                isContagiousSymptoms={hasContagiousSymptoms}
              />
            </div>
            
            {/* Speech Recognition Status - Top left corner */}
            {isListening && (
              <div className="absolute top-3 left-3 z-30 bg-red-500/90 border border-red-400 text-white px-3 py-2 rounded-lg backdrop-blur-sm text-sm flex items-center gap-2 shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="font-medium">Transcribing...</span>
              </div>
            )}
            
            {/* Live Transcript - Bottom overlay */}
            {transcript && (
              <div className="absolute bottom-20 left-3 right-3 z-30 bg-black/90 text-white p-3 rounded-lg text-sm max-h-24 overflow-y-auto shadow-lg">
                <div className="text-xs opacity-70 mb-1 font-medium">Live Transcript:</div>
                <div className="leading-relaxed">{transcript}</div>
              </div>
            )}
            
            {/* No video placeholder - Centered properly */}
            {!remoteParticipantIds[0] && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <VideoIcon className="size-8 sm:size-10 text-slate-400" />
                  </div>
                  <p className="text-slate-600 text-sm sm:text-base font-medium">Waiting for AI assistant...</p>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1">Connecting to medical consultation</p>
                </div>
              </div>
            )}
          </div>

          {/* TEXT CHAT AREA - Better constrained and responsive */}
          {showTextChat && (
            <div className={cn(
              "flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden shadow-lg",
              "w-full lg:w-1/3 h-[250px] sm:h-[300px] lg:h-full flex-shrink-0"
            )}>
              {/* Chat Header - Fixed height */}
              <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50 flex-shrink-0 h-14">
                <div className="flex items-center gap-2">
                  <MessageCircle className="size-4 text-blue-600" />
                  <h3 className="text-slate-800 font-medium text-sm">Chat Transcript</h3>
                </div>
                <Button
                  onClick={toggleTextChat}
                  variant="ghost"
                  size="icon"
                  className="text-slate-600 hover:bg-slate-100 h-6 w-6"
                  title="Close chat"
                >
                  <X className="size-3" />
                </Button>
              </div>

              {/* Messages Area - Properly scrollable */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
                {messages.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">
                    <MessageCircle className="size-8 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">No messages yet</p>
                    <p className="text-xs mt-1">Conversation will appear here</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "p-2.5 rounded-lg text-sm max-w-[85%] shadow-sm",
                        msg.startsWith('Patient') 
                          ? "bg-blue-100 border border-blue-200 text-blue-900 ml-auto" 
                          : "bg-slate-100 border border-slate-200 text-slate-800"
                      )}
                    >
                      <div className="font-semibold text-xs opacity-70 mb-1">
                        {msg.startsWith('Patient') ? 'Patient' : 'Medical Assistant'}
                      </div>
                      <div className="leading-relaxed">{msg.replace(/^(Patient|Medical Assistant): /, '')}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Area - Fixed height */}
              <div className="p-3 border-t border-slate-200 bg-slate-50 flex-shrink-0">
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-slate-300 rounded-md px-3 py-2 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    placeholder="Type message..."
                  />
                  <Button 
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Control Panel - Fixed at bottom with perfect alignment */}
        <div className="flex-shrink-0 border-t border-slate-200 bg-white/95 backdrop-blur-sm">
          <div className="p-4">
            <div className="flex justify-center items-center gap-3 max-w-md mx-auto">
              {/* Microphone Toggle (Audio) */}
              <Button 
                onClick={toggleAudio}
                className={cn(
                  "rounded-full transition-all duration-200 shadow-md flex items-center justify-center",
                  "w-12 h-12 sm:w-14 sm:h-14",
                  isMicEnabled 
                    ? "bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-300 hover:border-slate-400" 
                    : "bg-red-500 hover:bg-red-600 text-white border-2 border-red-600"
                )}
                title={isMicEnabled ? "Mute microphone" : "Unmute microphone"}
              >
                {isMicEnabled ? <MicIcon className="size-5 sm:size-6" /> : <MicOffIcon className="size-5 sm:size-6" />}
              </Button>

              {/* Speech Recognition Toggle (Transcription) */}
              {recognition && (
                <Button 
                  onClick={toggleSpeechRecognition}
                  className={cn(
                    "rounded-full transition-all duration-200 shadow-md flex items-center justify-center",
                    "w-12 h-12 sm:w-14 sm:h-14",
                    isListening 
                      ? "bg-purple-500 hover:bg-purple-600 text-white animate-pulse border-2 border-purple-600" 
                      : "bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-300 hover:border-slate-400"
                  )}
                  title={isListening ? "Stop speech transcription" : "Start speech transcription"}
                >
                  {isListening ? <AudioWaveform className="size-5 sm:size-6" /> : <AudioLines className="size-5 sm:size-6" />}
                </Button>
              )}

              {/* Video Toggle */}
              <Button 
                onClick={toggleVideo}
                className={cn(
                  "rounded-full transition-all duration-200 shadow-md flex items-center justify-center",
                  "w-12 h-12 sm:w-14 sm:h-14",
                  isCameraEnabled 
                    ? "bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-300 hover:border-slate-400" 
                    : "bg-red-500 hover:bg-red-600 text-white border-2 border-red-600"
                )}
                title={isCameraEnabled ? "Turn off camera" : "Turn on camera"}
              >
                {isCameraEnabled ? <VideoIcon className="size-5 sm:size-6" /> : <VideoOffIcon className="size-5 sm:size-6" />}
              </Button>

              {/* Text Chat Toggle */}
              <Button 
                onClick={toggleTextChat}
                className={cn(
                  "rounded-full transition-all duration-200 shadow-md flex items-center justify-center",
                  "w-12 h-12 sm:w-14 sm:h-14",
                  showTextChat 
                    ? "bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-700" 
                    : "bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-300 hover:border-slate-400"
                )}
                title={showTextChat ? "Hide text chat" : "Show text chat"}
              >
                <MessageCircle className="size-5 sm:size-6" />
              </Button>

              {/* End Call */}
              <Button 
                onClick={leaveConversation} 
                className={cn(
                  "bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-200 shadow-md flex items-center justify-center border-2 border-red-700",
                  "w-12 h-12 sm:w-14 sm:h-14"
                )}
                title="End conversation"
              >
                <PhoneIcon className="size-5 sm:size-6 rotate-135" />
              </Button>
            </div>
          </div>
        </div>

        <DailyAudio />
      </div>
    </DialogWrapper>
  );
};