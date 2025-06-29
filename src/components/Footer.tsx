import { GitFork, ExternalLink } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="flex w-full items-center justify-between gap-2 sm:gap-4">
      <a
        href="https://github.com/Tavus-Engineering/tavus-vibecode-quickstart"
        target="_blank"
        className="hover:shadow-footer-btn relative flex items-center justify-center gap-1 sm:gap-2 rounded-3xl border border-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.1)] px-2 py-2 sm:px-3 sm:py-3 text-xs sm:text-sm text-white transition-all duration-200 hover:text-primary h-[36px] sm:h-[44px]"
      >
        <GitFork className="size-3 sm:size-4" /> <span className="hidden xs:inline">Fork the demo</span>
      </a>

      <a
        href="https://docs.tavus.io/sections/conversational-video-interface/cvi-overview"
        target="_blank"
        className="relative flex items-center justify-center gap-1 sm:gap-2 rounded-3xl border border-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.1)] px-2 py-2 sm:px-3 sm:py-3 text-xs sm:text-sm text-white backdrop-blur-sm hover:bg-[rgba(255,255,255,0.15)] transition-colors duration-200 h-[36px] sm:h-[44px]"
      >
        <span className="hidden xs:inline">How it works</span> <ExternalLink className="size-3 sm:size-4" />
      </a>
    </footer>
  );
};