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
  
  const videoRef = useRef<HTMLVideoElement>(null);
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
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [daily, isCallJoined]);

  // Initialize mask detection
  useEffect(() => {
    const initMaskDetection = async () => {
      try {
        await maskDetector.loadModel();
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

  // Start mask detection when video is available
  useEffect(() => {
    if (isCameraEnabled && videoRef.current) {
      maskDetectionInterval.current = setInterval(async () => {
        if (videoRef.current) {
          try {
            const result = await maskDetector.detectMask(videoRef.current);
            setMaskResult(result);
          } catch (error) {
            console.error('Mask detection error:', error);
          }
        }
      }, 2000); // Check every 2 seconds

      return () => {
        if (maskDetectionInterval.current) {
          clearInterval(maskDetectionInterval.current);
        }
      };
    }
  }, [isCameraEnabled]);

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
        
        // Start speech recognition automatically after greeting
        setTimeout(() => {
          if (recognition && !isListening) {
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
  }, [conversation?.conversation_url, daily, isJoining, recognition]);

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
            if (recognition && !isListening) {
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
  }, [daily, recognition, isListening, isCallJoined]);

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
      <div className="h-full flex flex-col relative">
        {/* Main Content Area */}
        <div className="flex-1 p-2 sm:p-4 flex flex-col lg:flex-row gap-2 sm:gap-4 min-h-0">
          {/* VIDEO AREA - Responsive sizing */}
          <div className={cn(
            "relative overflow-hidden rounded-lg border-2 border-blue-300 shadow-lg transition-all duration-300 ease-in-out",
            showTextChat 
              ? "w-full lg:w-2/3 h-[250px] sm:h-[300px] lg:h-full" 
              : "w-full h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[550px]"
          )}>
            {/* Remote participant video */}
            {remoteParticipantIds[0] && (
              <Video
                id={remoteParticipantIds[0]}
                className="size-full"
                tileClassName="!object-cover rounded-lg w-full h-full"
              />
            )}
            
            {/* Local participant video (picture-in-picture) */}
            {localSessionId && (
              <div className="absolute bottom-2 right-2 border-2 border-blue-400 rounded-lg shadow-lg z-10">
                <Video
                  id={localSessionId}
                  tileClassName="!object-cover"
                  className={cn(
                    "w-12 h-9 sm:w-16 sm:h-12 md:w-20 md:h-15"
                  )}
                />
                <video
                  ref={videoRef}
                  className="hidden"
                  autoPlay
                  muted
                  playsInline
                />
              </div>
            )}
            
            {/* Mask Detection Overlay */}
            <MaskDetectionOverlay
              maskResult={maskResult}
              showMaskWarning={showMaskWarning}
              isContagiousSymptoms={hasContagiousSymptoms}
            />
            
            {/* Speech Recognition Status */}
            {isListening && (
              <div className="absolute top-2 left-2 bg-red-500/20 border border-red-400/30 text-red-200 px-3 py-2 rounded-lg backdrop-blur-sm text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                Transcribing...
              </div>
            )}
            
            {/* Live Transcript */}
            {transcript && (
              <div className="absolute bottom-16 left-2 right-2 bg-black/80 text-white p-2 rounded-lg text-sm max-h-20 overflow-y-auto">
                <div className="text-xs opacity-70 mb-1">Live Transcript:</div>
                {transcript}
              </div>
            )}
            
            {/* No video placeholder */}
            {!remoteParticipantIds[0] && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 rounded-lg">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <VideoIcon className="size-5 sm:size-6 md:size-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600 text-sm sm:text-base">Waiting for AI assistant...</p>
                </div>
              </div>
            )}
          </div>

          {/* TEXT CHAT AREA - Responsive sidebar */}
          {showTextChat && (
            <div className={cn(
              "flex flex-col bg-white border border-slate-200 rounded-lg overflow-hidden transition-all duration-300 ease-in-out",
              "w-full lg:w-1/3 h-[200px] sm:h-[250px] lg:h-full flex-shrink-0"
            )}>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-2 sm:p-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <MessageCircle className="size-3 sm:size-4 text-blue-600" />
                  <h3 className="text-slate-800 font-medium text-xs sm:text-sm">Chat</h3>
                </div>
                <Button
                  onClick={toggleTextChat}
                  variant="ghost"
                  size="icon"
                  className="text-slate-600 hover:bg-slate-100 h-5 w-5 sm:h-6 sm:w-6"
                  title="Close chat"
                >
                  <X className="size-2 sm:size-3" />
                </Button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1 sm:space-y-2 min-h-0">
                {messages.length === 0 ? (
                  <div className="text-center text-slate-400 py-4">
                    <MessageCircle className="size-6 sm:size-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No messages yet</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "p-1.5 sm:p-2 rounded text-xs max-w-[90%]",
                        msg.startsWith('Patient') 
                          ? "bg-blue-100 border border-blue-200 text-blue-800 ml-auto" 
                          : "bg-slate-100 border border-slate-200 text-slate-700"
                      )}
                    >
                      <div className="font-medium text-xs opacity-70 mb-1">
                        {msg.startsWith('Patient') ? 'Patient' : 'Medical Assistant'}
                      </div>
                      <div className="text-xs leading-tight">{msg.replace(/^(Patient|Medical Assistant): /, '')}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Input Area */}
              <div className="p-2 sm:p-3 border-t border-slate-200 bg-slate-50 flex-shrink-0">
                <div className="flex gap-1 sm:gap-2">
                  <input
                    className="flex-1 border border-slate-300 rounded px-2 py-1 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    placeholder="Type message..."
                  />
                  <Button 
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs h-auto"
                  >
                    <Send className="size-2 sm:size-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Control Panel - Fixed at bottom with responsive sizing */}
        <div className="flex-shrink-0 p-2 sm:p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex justify-center items-center gap-2 sm:gap-4">
            {/* Microphone Toggle (Audio) */}
            <Button 
              onClick={toggleAudio}
              className={cn(
                "rounded-full transition-all duration-200 shadow-lg flex items-center justify-center",
                "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12",
                isMicEnabled 
                  ? "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300" 
                  : "bg-red-500 hover:bg-red-600 text-white"
              )}
              title={isMicEnabled ? "Mute microphone" : "Unmute microphone"}
            >
              {isMicEnabled ? <MicIcon className="size-3 sm:size-4 md:size-5" /> : <MicOffIcon className="size-3 sm:size-4 md:size-5" />}
            </Button>

            {/* Speech Recognition Toggle (Transcription) */}
            {recognition && (
              <Button 
                onClick={toggleSpeechRecognition}
                className={cn(
                  "rounded-full transition-all duration-200 shadow-lg flex items-center justify-center",
                  "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12",
                  isListening 
                    ? "bg-purple-500 hover:bg-purple-600 text-white animate-pulse" 
                    : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300"
                )}
                title={isListening ? "Stop speech transcription" : "Start speech transcription"}
              >
                {isListening ? <AudioWaveform className="size-3 sm:size-4 md:size-5" /> : <AudioLines className="size-3 sm:size-4 md:size-5" />}
              </Button>
            )}

            {/* Video Toggle */}
            <Button 
              onClick={toggleVideo}
              className={cn(
                "rounded-full transition-all duration-200 shadow-lg flex items-center justify-center",
                "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12",
                isCameraEnabled 
                  ? "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300" 
                  : "bg-red-500 hover:bg-red-600 text-white"
              )}
              title={isCameraEnabled ? "Turn off camera" : "Turn on camera"}
            >
              {isCameraEnabled ? <VideoIcon className="size-3 sm:size-4 md:size-5" /> : <VideoOffIcon className="size-3 sm:size-4 md:size-5" />}
            </Button>

            {/* Text Chat Toggle */}
            <Button 
              onClick={toggleTextChat}
              className={cn(
                "rounded-full transition-all duration-200 shadow-lg flex items-center justify-center",
                "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12",
                showTextChat 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300"
              )}
              title={showTextChat ? "Hide text chat" : "Show text chat"}
            >
              <MessageCircle className="size-3 sm:size-4 md:size-5" />
            </Button>

            {/* End Call */}
            <Button 
              onClick={leaveConversation} 
              className={cn(
                "bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-200 shadow-lg flex items-center justify-center",
                "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
              )}
              title="End conversation"
            >
              <PhoneIcon className="size-3 sm:size-4 md:size-5 rotate-135" />
            </Button>
          </div>
        </div>

        <DailyAudio />
      </div>
    </DialogWrapper>
  );
};