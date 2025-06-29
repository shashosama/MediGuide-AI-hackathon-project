import React from 'react';
import { SymptomAnalysis } from '@/utils/nlpProcessor';
import { RiskAssessment } from '@/utils/riskAssessment';
import { AlertTriangle, TrendingUp, Clock, Target, Activity, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdvancedAnalyticsProps {
  analysis: SymptomAnalysis;
  riskAssessment: RiskAssessment;
}

export const AdvancedAnalytics: React.FC<AdvancedAnalyticsProps> = ({
  analysis,
  riskAssessment
}) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-400 bg-green-500/20 border-green-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-400/30';
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-400/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-400/30';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return <AlertTriangle className="size-3 sm:size-4 text-red-400" />;
      case 'high': return <TrendingUp className="size-3 sm:size-4 text-orange-400" />;
      case 'medium': return <Clock className="size-3 sm:size-4 text-yellow-400" />;
      case 'low': return <Target className="size-3 sm:size-4 text-green-400" />;
      default: return <Clock className="size-3 sm:size-4 text-gray-400" />;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <Heart className="size-3 sm:size-4 text-red-400" />;
      case 'severe': return <Activity className="size-3 sm:size-4 text-orange-400" />;
      case 'moderate': return <TrendingUp className="size-3 sm:size-4 text-yellow-400" />;
      case 'mild': return <Target className="size-3 sm:size-4 text-green-400" />;
      default: return <Activity className="size-3 sm:size-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 bg-black/20 rounded-lg border border-white/10">
      <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Advanced Symptom Analysis</h3>
      
      {/* Risk Assessment Summary */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        <div className={cn(
          "p-3 sm:p-4 rounded-lg border",
          getRiskColor(riskAssessment.riskLevel)
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm sm:text-base">Risk Level</span>
            {getUrgencyIcon(analysis.urgency)}
          </div>
          <div className="text-xl sm:text-2xl font-bold capitalize">
            {riskAssessment.riskLevel}
          </div>
          <div className="text-xs sm:text-sm opacity-80">
            Score: {riskAssessment.riskScore}/100
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-lg border border-white/20 bg-white/5">
          <div className="flex items-center gap-2 mb-2">
            {getSeverityIcon(analysis.severity)}
            <span className="font-medium text-white text-sm sm:text-base">Severity Level</span>
          </div>
          <div className="text-base sm:text-lg font-semibold text-primary capitalize">
            {analysis.severity}
          </div>
        </div>

        <div className="p-3 sm:p-4 rounded-lg border border-white/20 bg-white/5">
          <div className="font-medium text-white mb-2 text-sm sm:text-base">Time to Seek Care</div>
          <div className="text-base sm:text-lg font-semibold text-primary capitalize">
            {riskAssessment.timeToSeek.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="space-y-3 sm:space-y-4">
        <div>
          <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Detected Symptoms</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.symptoms.map((symptom, index) => (
              <div key={index} className="px-2 sm:px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-200 text-xs sm:text-sm">
                {symptom}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Body Parts Affected</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.bodyParts.map((part, index) => (
              <div key={index} className="px-2 sm:px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-purple-200 text-xs sm:text-sm">
                {part}
              </div>
            ))}
          </div>
        </div>

        {analysis.duration && (
          <div>
            <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Duration</h4>
            <div className="px-2 sm:px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded-full text-cyan-200 text-xs sm:text-sm inline-block">
              {analysis.duration}
            </div>
          </div>
        )}
      </div>

      {/* Red Flags */}
      {riskAssessment.redFlags.length > 0 && (
        <div className="p-3 sm:p-4 bg-red-500/20 border border-red-400/30 rounded-lg">
          <h4 className="text-red-200 font-medium mb-2 flex items-center gap-2 text-sm sm:text-base">
            <AlertTriangle className="size-3 sm:size-4" />
            Warning Signs Detected
          </h4>
          <ul className="space-y-1">
            {riskAssessment.redFlags.map((flag, index) => (
              <li key={index} className="text-red-200 text-xs sm:text-sm">• {flag}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      <div className="p-3 sm:p-4 bg-white/5 rounded-lg">
        <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Recommendations</h4>
        <ul className="space-y-1">
          {riskAssessment.recommendations.map((rec, index) => (
            <li key={index} className="text-gray-300 text-xs sm:text-sm">• {rec}</li>
          ))}
        </ul>
      </div>

      {/* Sentiment Analysis */}
      <div className="p-3 sm:p-4 bg-white/5 rounded-lg">
        <h4 className="text-white font-medium mb-2 text-sm sm:text-base">Emotional State Analysis</h4>
        <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">Sentiment Score:</span>
            <span className={cn(
              "font-medium",
              analysis.sentiment.score > 0 ? "text-green-400" : "text-red-400"
            )}>
              {analysis.sentiment.score > 0 ? '+' : ''}{analysis.sentiment.score}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Emotional Intensity:</span>
            <span className="font-medium text-blue-400">
              {Math.abs(analysis.sentiment.comparative).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};