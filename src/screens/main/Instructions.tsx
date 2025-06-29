import { createConversation } from "@/services/api/conversation";
import {
  DialogWrapper,
  AnimatedTextBlockWrapper,
} from "@/components/layout/DialogWrapper";
import { screenAtom } from "@/store/screens";
import { conversationAtom } from "@/store/conversation";
import React, { useCallback, useMemo, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { AlertTriangle, Mic, Video, Stethoscope, MessageCircle } from "lucide-react";
import { useDaily, useDailyEvent, useDevices } from "@daily-co/daily-react";
import { ConversationError } from "@/components/chat/ConversationError";
import zoomSound from "@/assets/sounds/zoom.mp3";
import { Button } from "@/components/ui/button";
import { apiTokenAtom } from "@/store/tokens";
import { quantum } from 'ldrs';
import gloriaVideo from "@/assets/video/gloria.mp4";

// Register the quantum loader
quantum.register();

const useCreateConversationMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setScreenState] = useAtom(screenAtom);
  const [, setConversation] = useAtom(conversationAtom);
  const token = useAtomValue(apiTokenAtom);

  const createConversationRequest = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!token) {
        throw new Error("API token is required");
      }
      
      console.log("Creating conversation with token:", token);
      const conversation = await createConversation(token);
      console.log("Conversation created:", conversation);
      
      setConversation(conversation);
      setScreenState({ currentScreen: "conversation" });
    } catch (error) {
      console.error("Conversation creation error:", error);
      setError(error instanceof Error ? error.message : "Failed to create conversation");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createConversationRequest,
  };
};

export const Instructions: React.FC = () => {
  const daily = useDaily();
  const { currentMic, setMicrophone, setSpeaker } = useDevices();
  const { createConversationRequest, isLoading: isCreatingConversation, error: conversationError } = useCreateConversationMutation();
  const [getUserMediaError, setGetUserMediaError] = useState(false);
  const [isInitializingCamera, setIsInitializingCamera] = useState(false);
  const [, setScreenState] = useAtom(screenAtom);
  const audio = useMemo(() => {
    const audioObj = new Audio(zoomSound);
    audioObj.volume = 0.7;
    return audioObj;
  }, []);

  useDailyEvent(
    "camera-error",
    useCallback(() => {
      console.error("Camera error detected");
      setGetUserMediaError(true);
      setIsInitializingCamera(false);
    }, []),
  );

  const handleVideoChat = async () => {
    try {
      console.log("Starting video chat initialization...");
      setIsInitializingCamera(true);
      setGetUserMediaError(false);
      
      // Play sound effect
      try {
        audio.currentTime = 0;
        await audio.play();
      } catch (audioError) {
        console.warn("Audio playback failed:", audioError);
      }
      
      // Initialize camera and microphone
      if (daily) {
        try {
          console.log("Initializing camera...");
          const mediaResult = await daily.startCamera({
            startVideoOff: false,
            startAudioOff: false,
            audioSource: currentMic?.device?.deviceId || "default",
          });
          
          console.log("Camera initialized:", mediaResult);
          
          // Set default devices if needed
          if (mediaResult) {
            // @ts-expect-error deviceId exists in the MediaDeviceInfo
            const isDefaultMic = mediaResult.mic?.deviceId === "default";
            // @ts-expect-error deviceId exists in the MediaDeviceInfo
            const isDefaultSpeaker = mediaResult.speaker?.deviceId === "default";

            if (!isDefaultMic) {
              setMicrophone("default");
            }
            if (!isDefaultSpeaker) {
              setSpeaker("default");
            }
          }
          
          // Wait a moment for camera to fully initialize
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Create conversation
          console.log("Creating conversation...");
          await createConversationRequest();
          
        } catch (cameraError) {
          console.error("Camera initialization error:", cameraError);
          setGetUserMediaError(true);
          throw cameraError;
        }
      } else {
        console.error("Daily client not available");
        throw new Error("Video client not initialized");
      }
    } catch (error) {
      console.error("Video chat initialization error:", error);
      setGetUserMediaError(true);
    } finally {
      setIsInitializingCamera(false);
    }
  };

  const handleTextChat = () => {
    setScreenState({ currentScreen: "textChat" });
  };

  // Show loading state during camera initialization or conversation creation
  if (isInitializingCamera || isCreatingConversation) {
    return (
      <DialogWrapper>
        <video
          src={gloriaVideo}
          autoPlay
          muted
          loop
          playsInline
          className="fixed inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm" />
        <AnimatedTextBlockWrapper>
          <div className="flex flex-col items-center justify-center gap-4">
            <l-quantum
              size="45"
              speed="1.75"
              color="#3b82f6"
            ></l-quantum>
            <p className="text-slate-700 text-base sm:text-lg">
              {isInitializingCamera ? "Initializing camera and microphone..." : "Connecting to Medical Assistant..."}
            </p>
            <p className="text-slate-500 text-sm">
              {isInitializingCamera ? "Please allow camera and microphone access" : "Creating secure video session"}
            </p>
          </div>
        </AnimatedTextBlockWrapper>
      </DialogWrapper>
    );
  }

  // Show error state if conversation creation failed
  if (conversationError) {
    return (
      <ConversationError 
        onClick={() => {
          // Reset error state and try again
          window.location.reload();
        }} 
      />
    );
  }

  return (
    <DialogWrapper>
      <video
        src={gloriaVideo}
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 h-full w-full object-cover opacity-20"
      />
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm" />
      <AnimatedTextBlockWrapper>
        {/* Hospital Name Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            BateShaShuan Hospital
          </h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Stethoscope className="size-6 sm:size-8 text-blue-600" />
          <h2 
            className="pt-1 text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold"
            style={{
              fontFamily: 'Source Code Pro, monospace'
            }}
          >
            <span className="text-slate-800">Medical</span>{" "}
            <span style={{
              color: '#3b82f6'
            }}>Information Assistant</span>
          </h2>
        </div>
        
        <p className="max-w-[650px] text-center text-sm sm:text-base md:text-lg text-slate-600 mb-6 sm:mb-8 px-4">
          Get guidance on which hospital department would be most appropriate for your symptoms. 
          Choose between video consultation or text-based chat.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-6 sm:mb-8 max-w-[600px] mx-4">
          <p className="text-xs sm:text-sm text-blue-800 text-center">
            <strong>Important:</strong> This assistant provides departmental guidance only and does not 
            replace professional medical diagnosis. Always consult with healthcare professionals for 
            proper medical evaluation and treatment.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 px-4">
          <Button
            onClick={handleVideoChat}
            className="relative z-20 flex items-center justify-center gap-2 rounded-3xl border border-blue-300 px-6 sm:px-8 py-2 text-sm text-slate-800 transition-all duration-200 hover:text-blue-600 disabled:opacity-50 bg-white hover:bg-blue-50"
            disabled={isInitializingCamera || isCreatingConversation}
            style={{
              height: '44px',
              transition: 'all 0.2s ease-in-out',
            }}
            onMouseEnter={(e) => {
              if (!isInitializingCamera && !isCreatingConversation) {
                e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Video className="size-4 sm:size-5" />
            <span className="text-xs sm:text-sm">
              {isInitializingCamera || isCreatingConversation ? "Connecting..." : "Video Consultation"}
            </span>
          </Button>

          <Button
            onClick={handleTextChat}
            className="relative z-20 flex items-center justify-center gap-2 rounded-3xl border border-blue-300 px-6 sm:px-8 py-2 text-sm text-slate-800 transition-all duration-200 hover:text-blue-600 bg-white hover:bg-blue-50"
            style={{
              height: '44px',
              transition: 'all 0.2s ease-in-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <MessageCircle className="size-4 sm:size-5" />
            <span className="text-xs sm:text-sm">Text Chat</span>
          </Button>
        </div>

        {getUserMediaError && (
          <div className="mb-4 flex items-center gap-2 text-wrap rounded-lg border bg-red-50 border-red-200 p-3 text-red-800 backdrop-blur-sm max-w-[600px] mx-4">
            <AlertTriangle className="size-4 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1">Camera/Microphone Access Required</p>
              <p className="text-xs opacity-90">
                Please allow camera and microphone access for video consultation, or use the text chat option instead.
              </p>
            </div>
          </div>
        )}

        <span className="absolute bottom-4 sm:bottom-6 px-4 text-xs sm:text-sm text-slate-500 text-center">
          By starting a consultation, I accept the{' '}
          <a href="#" className="text-blue-600 hover:underline">Terms of Use</a> and acknowledge the{' '}
          <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
        </span>
      </AnimatedTextBlockWrapper>
    </DialogWrapper>
  );
};