import React, { useState, useEffect } from 'react';
import { userDataManager, PersonalizedRecommendation, UserProfile } from '@/utils/userDataManager';
import { RiskAssessment } from '@/utils/riskAssessment';
import { AlertTriangle, Info, Lightbulb, X, UserPlus, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PersonalizedRecommendationsProps {
  currentSymptoms: string[];
  riskAssessment?: RiskAssessment;
  onNavigateToProfile?: () => void;
  onNavigateToLogin?: () => void;
}

export const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({
  currentSymptoms,
  riskAssessment,
  onNavigateToProfile,
  onNavigateToLogin
}) => {
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showNoProfilePrompt, setShowNoProfilePrompt] = useState(false);
  const [promptDismissed, setPromptDismissed] = useState(false);

  useEffect(() => {
    const profile = userDataManager.getUserProfile();
    setUserProfile(profile);

    if (currentSymptoms.length > 0 && riskAssessment) {
      if (profile) {
        // User has profile - show personalized recommendations
        const personalizedAdvice = userDataManager.generatePersonalizedAdvice(
          currentSymptoms,
          riskAssessment.riskLevel,
          riskAssessment.riskScore
        );
        setRecommendations(personalizedAdvice);
        setShowNoProfilePrompt(false);
      } else {
        // No profile - show prompt to create one (unless dismissed)
        if (!promptDismissed) {
          setShowNoProfilePrompt(true);
        }
        setRecommendations([]);
      }
    } else {
      setRecommendations([]);
      setShowNoProfilePrompt(false);
    }
  }, [currentSymptoms, riskAssessment, promptDismissed]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="size-3 sm:size-4 text-red-400" />;
      case 'high': return <AlertTriangle className="size-3 sm:size-4 text-orange-400" />;
      case 'medium': return <Info className="size-3 sm:size-4 text-yellow-400" />;
      default: return <Info className="size-3 sm:size-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 border-red-400/30 text-red-200';
      case 'high': return 'bg-orange-500/20 border-orange-400/30 text-orange-200';
      case 'medium': return 'bg-yellow-500/20 border-yellow-400/30 text-yellow-200';
      default: return 'bg-gray-500/20 border-gray-400/30 text-gray-200';
    }
  };

  const handleCloseNoProfilePrompt = () => {
    setShowNoProfilePrompt(false);
    setPromptDismissed(true); // Mark as dismissed so it won't show again
  };

  // Show no profile prompt with Register/Log in options
  if (showNoProfilePrompt && !userProfile && !promptDismissed) {
    return (
      <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-400/30 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-4 sm:size-5 text-blue-400" />
            <h3 className="text-base sm:text-lg font-semibold text-white">Get Personalized Recommendations</h3>
          </div>
          <Button
            onClick={handleCloseNoProfilePrompt}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-white/10 h-6 w-6"
            title="Close this prompt"
          >
            <X className="size-3 sm:size-4" />
          </Button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <p className="text-xs sm:text-sm text-blue-200">
            Create a profile to receive personalized medical guidance based on your history, allergies, 
            medications, and chronic conditions. This helps provide more accurate and relevant recommendations.
          </p>
          
          <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
            <Button
              onClick={onNavigateToProfile}
              className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 flex-1 text-xs sm:text-sm h-9 sm:h-10"
            >
              <UserPlus className="size-3 sm:size-4" />
              Register New Account
            </Button>
            
            <Button
              onClick={onNavigateToLogin}
              className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2 flex-1 text-xs sm:text-sm h-9 sm:h-10"
            >
              <LogIn className="size-3 sm:size-4" />
              Log In Existing Account
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <span>🔒 Your data stays private and secure</span>
            <span className="hidden xs:inline">•</span>
            <span className="hidden xs:inline">✨ Get personalized care recommendations</span>
          </div>
        </div>
      </div>
    );
  }

  // Show personalized recommendations if user has profile
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-black/20 rounded-lg border border-white/10 relative">
      <div className="flex items-center gap-2">
        <Lightbulb className="size-4 sm:size-5 text-primary" />
        <h3 className="text-base sm:text-lg font-semibold text-white">Personalized Recommendations</h3>
      </div>

      {/* Recommendations List */}
      <div className="space-y-3">
        {recommendations.map((recommendation, index) => (
          <div
            key={index}
            className={cn(
              "p-3 sm:p-4 rounded-lg border",
              getPriorityColor(recommendation.priority)
            )}
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getPriorityIcon(recommendation.priority)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <span className="font-medium capitalize text-xs sm:text-sm">
                    {recommendation.priority} Priority
                  </span>
                  {recommendation.actionRequired && (
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                      Action Required
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm mb-2">{recommendation.message}</p>
                <div className="flex flex-wrap gap-1">
                  {recommendation.basedOn.map((factor, factorIndex) => (
                    <span
                      key={factorIndex}
                      className="px-2 py-0.5 bg-white/10 rounded text-xs opacity-80"
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="text-xs text-gray-400 mt-3 sm:mt-4 p-2 sm:p-3 bg-white/5 rounded">
        <Info className="size-3 inline mr-1" />
        These recommendations are based on your medical history, current symptoms, and risk assessment. 
        Always consult with healthcare professionals for personalized medical advice.
      </div>
    </div>
  );
};