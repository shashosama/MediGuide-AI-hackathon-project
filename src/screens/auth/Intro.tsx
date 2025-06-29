import { AnimatedWrapper } from "@/components/layout/DialogWrapper";
import React from "react";
import { useAtom } from "jotai";
import { screenAtom } from "@/store/screens";
import { Unlock } from "lucide-react";
import AudioButton from "@/components/ui/AudioButton";
import { apiTokenAtom } from "@/store/tokens";
import { Input } from "@/components/ui/input";
import gloriaVideo from "@/assets/video/gloria.mp4";

export const Intro: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);
  const [token, setToken] = useAtom(apiTokenAtom);

  const handleClick = () => {
    setScreenState({ currentScreen: "instructions" });
  };

  return (
    <AnimatedWrapper>
      <div className="flex size-full flex-col items-center justify-center">
        <video
          src={gloriaVideo}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" />
        <div className="relative z-10 flex flex-col items-center gap-2 py-4 px-4 rounded-xl border border-blue-200 bg-white/90 backdrop-blur-sm shadow-lg" 
          style={{ 
            fontFamily: 'Inter, sans-serif',
          }}>
          <img src="/images/vector.svg" alt="Logo" className="mt-2 mb-1" style={{ width: '30px', height: 'auto' }} />

          {/* Hospital Name */}
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1">BateShaShuan Hospital</h1>
          <div className="w-16 h-0.5 bg-blue-600 rounded-full mb-2"></div>

          <h2 className="text-base sm:text-lg font-semibold text-slate-700 mb-1" style={{ fontFamily: 'Source Code Pro, monospace' }}>Medical AI Assistant</h2>

          <div className="flex flex-col gap-2 items-center mt-3 sm:mt-4">
            <Input
              type="password"
              value={token || ""}
              onChange={(e) => {
                const newToken = e.target.value;
                setToken(newToken);
                localStorage.setItem('tavus-token', newToken);
              }}
              placeholder="Enter Tavus API Key"
              className="w-full sm:w-64 bg-white text-slate-800 rounded-3xl border border-blue-300 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ 
                color: '#1e293b', 
                fontFamily: 'Inter, sans-serif',
              }}
            />

            <p className="text-xs sm:text-sm text-slate-600 transition-all duration-200">
              Don't have a key?{" "}
              <a
                href="https://platform.tavus.io/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-600"
              >
                Create an account.
              </a>
            </p>
          </div>

          <AudioButton 
            onClick={handleClick}
            className="relative z-20 flex items-center justify-center gap-2 rounded-3xl border border-blue-300 px-3 sm:px-4 py-2 text-xs sm:text-sm text-slate-800 transition-all duration-200 hover:text-blue-600 mt-3 sm:mt-4 disabled:opacity-50 bg-white hover:bg-blue-50"
            disabled={!token}
            style={{
              height: '40px',
              transition: 'all 0.2s ease-in-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Unlock className="size-3 sm:size-4" />
            Start Medical Assistant
          </AudioButton>
        </div>
      </div>
    </AnimatedWrapper>
  );
};