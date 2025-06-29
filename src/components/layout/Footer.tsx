export const Footer = () => {
  return (
    <footer className="flex w-full items-center justify-center gap-2 sm:gap-4">
      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
        <span className="font-medium">MediGuide AI</span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:inline">Intelligent Medical Triage Assistant</span>
      </div>
    </footer>
  );
};