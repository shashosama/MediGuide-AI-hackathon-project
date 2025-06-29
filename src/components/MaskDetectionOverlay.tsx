import React from 'react';
import { AlertTriangle, Shield, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MaskDetectionResult } from '@/utils/maskDetection';

interface MaskDetectionOverlayProps {
  maskResult: MaskDetectionResult | null;
  showMaskWarning: boolean;
  isContagiousSymptoms: boolean;
}

export const MaskDetectionOverlay: React.FC<MaskDetectionOverlayProps> = ({
  maskResult,
  showMaskWarning,
  isContagiousSymptoms
}) => {
  // Always show something if we have mask detection running
  if (!maskResult) {
    return (
      <div className="bg-blue-500/80 border border-blue-400 text-white px-3 py-2 rounded-lg backdrop-blur-sm text-sm font-medium shadow-lg">
        <div className="flex items-center gap-2">
          <Shield className="size-4 animate-pulse" />
          <span>Analyzing...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Mask Detection Status - Always visible with accurate results */}
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm text-sm font-medium border shadow-lg transition-all duration-300",
        maskResult.hasMask 
          ? "bg-green-500/90 border-green-400 text-white"
          : "bg-red-500/90 border-red-400 text-white"
      )}>
        {maskResult.hasMask ? (
          <>
            <ShieldCheck className="size-4" />
            <span>Mask Detected</span>
          </>
        ) : (
          <>
            <Shield className="size-4" />
            <span>No Mask</span>
          </>
        )}
        <span className="text-xs opacity-90 ml-1">
          {Math.round(maskResult.confidence * 100)}%
        </span>
      </div>

      {/* Safety Warning for Contagious Symptoms */}
      {showMaskWarning && !maskResult.hasMask && isContagiousSymptoms && (
        <div className="bg-orange-500/90 border border-orange-400 text-white px-3 py-2 rounded-lg backdrop-blur-sm text-sm max-w-[280px] shadow-lg animate-pulse">
          <div className="flex items-start gap-2">
            <AlertTriangle className="size-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">⚠️ Mask Recommended</p>
              <p className="text-xs opacity-90 leading-relaxed">
                You mentioned flu-like symptoms. Please consider wearing a mask to protect others in the medical facility.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};