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
    <div className="space-y-2">
      {/* Mask Detection Status */}
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm text-sm font-medium border shadow-lg",
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
            <span>No Mask Detected</span>
          </>
        )}
        <span className="text-xs opacity-80">
          ({Math.round(maskResult.confidence * 100)}%)
        </span>
      </div>

      {/* Mask Warning for Contagious Symptoms */}
      {showMaskWarning && !maskResult.hasMask && isContagiousSymptoms && (
        <div className="bg-orange-500/90 border border-orange-400 text-white px-3 py-2 rounded-lg backdrop-blur-sm text-sm max-w-[280px] shadow-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="size-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Mask Recommended</p>
              <p className="text-xs opacity-90 leading-relaxed">
                Since you're experiencing flu-like symptoms, please consider wearing a mask to protect others.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};