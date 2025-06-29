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
  if (!maskResult) return null;

  return (
    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20">
      {/* Mask Detection Status */}
      <div className={cn(
        "flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg backdrop-blur-sm text-xs sm:text-sm font-medium mb-2",
        maskResult.hasMask 
          ? "bg-green-500/20 border border-green-400/30 text-green-200"
          : "bg-red-500/20 border border-red-400/30 text-red-200"
      )}>
        {maskResult.hasMask ? (
          <>
            <ShieldCheck className="size-3 sm:size-4" />
            <span>Mask Detected</span>
          </>
        ) : (
          <>
            <Shield className="size-3 sm:size-4" />
            <span>No Mask Detected</span>
          </>
        )}
        <span className="text-xs opacity-70">
          ({Math.round(maskResult.confidence * 100)}%)
        </span>
      </div>

      {/* Mask Warning for Contagious Symptoms */}
      {showMaskWarning && !maskResult.hasMask && isContagiousSymptoms && (
        <div className="bg-orange-500/20 border border-orange-400/30 text-orange-200 px-2 sm:px-3 py-1 sm:py-2 rounded-lg backdrop-blur-sm text-xs sm:text-sm max-w-[200px] sm:max-w-xs">
          <div className="flex items-start gap-1 sm:gap-2">
            <AlertTriangle className="size-3 sm:size-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Mask Recommended</p>
              <p className="text-xs opacity-90">
                Since you're experiencing flu-like or contagious symptoms, 
                please consider wearing a mask to protect others.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};