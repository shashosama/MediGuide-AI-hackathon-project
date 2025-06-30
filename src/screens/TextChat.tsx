import React, { useState, useRef, useEffect } from "react";
import { DialogWrapper } from "@/components/DialogWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { handleSymptomInput } from "@/utils/symptomHelper";
import { nlpProcessor, SymptomAnalysis } from "@/utils/nlpProcessor";
import { riskAssessmentEngine, RiskAssessment } from "@/utils/riskAssessment";
import { AdvancedAnalytics } from "@/components/AdvancedAnalytics";
import { VoiceRecognition } from "@/components/VoiceRecognition";
import { UserProfile } from "@/components/UserProfile";
import { MedicalHistory } from "@/components/MedicalHistory";
import { PersonalizedRecommendations } from "@/components/PersonalizedRecommendations";
import { authManager } from "@/utils/authManager";
import { useAtom } from "jotai";
import { screenAtom } from "@/store/screens";
import { Send, ArrowLeft, Stethoscope, Bot, User, BarChart3, History, UserIcon, LogOut, UserPlus, LogIn, X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  analysis?: SymptomAnalysis;
  riskAssessment?: RiskAssessment;
}

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  allergies: string[];
  medications: string[];
  chronicConditions: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export const TextChat: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your advanced medical information assistant with AI-powered symptom analysis. I can analyze your symptoms using natural language processing, assess risk levels, and provide personalized guidance based on your medical history. Please describe what you're experiencing, and I'll provide comprehensive guidance. How are you feeling today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'analytics' | 'profile' | 'history'>('chat');
  const [currentAnalysis, setCurrentAnalysis] = useState<SymptomAnalysis | null>(null);
  const [currentRiskAssessment, setCurrentRiskAssessment] = useState<RiskAssessment | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentSymptoms, setCurrentSymptoms] = useState<string[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginData, setLoginData] = useState<LoginFormData>({ email: '', password: '' });
  const [registerData, setRegisterData] = useState<RegisterFormData>({
    email: '', password: '', confirmPassword: '', name: '', dateOfBirth: '', gender: '',
    allergies: [], medications: [], chronicConditions: [],
    emergencyContact: { name: '', phone: '', relationship: '' }
  });
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check if user is logged in on component mount
    const loadCurrentUser = async () => {
      if (authManager.isLoggedIn()) {
        const user = await authManager.getCurrentUserWithProfile();
        setCurrentUser(user);
      }
    };
    loadCurrentUser();
  }, []);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    // Mark that user has interacted
    if (!hasInteracted) {
      setHasInteracted(true);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!text) setInput("");
    setIsTyping(true);

    // Perform advanced analysis
    const analysis = nlpProcessor.analyzeSymptoms(messageText);
    const riskAssessment = riskAssessmentEngine.assessRisk(analysis);
    
    setCurrentAnalysis(analysis);
    setCurrentRiskAssessment(riskAssessment);
    setCurrentSymptoms(analysis.symptoms);

    // Save to medical history if user is logged in and has symptoms
    if (currentUser && analysis.symptoms.length > 0) {
      try {
        await authManager.addMedicalRecord({
          symptoms: analysis.symptoms,
          department: handleSymptomInput(messageText).split(' ')[7] || 'General Medicine',
          riskLevel: riskAssessment.riskLevel,
          riskScore: riskAssessment.riskScore,
          notes: messageText,
          followUpRequired: riskAssessment.riskLevel === 'high' || riskAssessment.riskLevel === 'critical',
          followUpDate: riskAssessment.riskLevel === 'critical' ? 
            new Date(Date.now() + 24 * 60 * 60 * 1000) : // 1 day for critical
            riskAssessment.riskLevel === 'high' ? 
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : // 1 week for high
            undefined
        });
      } catch (error: unknown) {
        console.error('Failed to save medical record:', error);
      }
    }

    // Simulate AI thinking time
    setTimeout(() => {
      const response = handleSymptomInput(messageText);
      
      // Enhanced response with risk assessment and personalized advice
      let enhancedResponse = response;
      
      if (riskAssessment.riskLevel === 'critical' || riskAssessment.riskLevel === 'high') {
        enhancedResponse += `\n\n🚨 **Risk Assessment**: ${riskAssessment.riskLevel.toUpperCase()} risk detected (${riskAssessment.riskScore}/100)`;
        enhancedResponse += `\n⏰ **Recommended Action**: ${riskAssessment.timeToSeek.replace('_', ' ')}`;
        
        if (riskAssessment.redFlags.length > 0) {
          enhancedResponse += `\n⚠️ **Warning Signs**: ${riskAssessment.redFlags.join(', ')}`;
        }
      }

      if (analysis.severity === 'severe' || analysis.severity === 'critical') {
        enhancedResponse += `\n\n📊 **Severity Level**: ${analysis.severity.toUpperCase()}`;
      }

      if (analysis.bodyParts.length > 0) {
        enhancedResponse += `\n🎯 **Affected Areas**: ${analysis.bodyParts.join(', ')}`;
      }

      // Add personalized recommendations if user has profile
      if (currentUser) {
        enhancedResponse += `\n\n💡 **Note**: Your medical history and profile information have been considered in this assessment.`;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: enhancedResponse,
        sender: 'ai',
        timestamp: new Date(),
        analysis,
        riskAssessment
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 2000);
  };

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      setAuthError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setAuthError('');

    const result = await authManager.login(loginData);
    
    if (result.success) {
      setCurrentUser(result.user);
      setShowAuthModal(false);
      setLoginData({ email: '', password: '' });
      setActiveTab('profile');
    } else {
      setAuthError(result.error || 'Login failed');
    }

    setIsLoading(false);
  };

  const handleRegister = async () => {
    if (!registerData.email || !registerData.password || !registerData.name) {
      setAuthError('Please fill in all required fields');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }

    if (registerData.password.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setAuthError('');

    const result = await authManager.register({
      email: registerData.email,
      password: registerData.password,
      name: registerData.name,
      dateOfBirth: registerData.dateOfBirth,
      gender: registerData.gender,
      allergies: registerData.allergies,
      medications: registerData.medications,
      chronicConditions: registerData.chronicConditions,
      emergencyContact: registerData.emergencyContact.name ? registerData.emergencyContact : undefined
    });
    
    if (result.success) {
      setCurrentUser(result.user);
      setShowAuthModal(false);
      setRegisterData({
        email: '', password: '', confirmPassword: '', name: '', dateOfBirth: '', gender: '',
        allergies: [], medications: [], chronicConditions: [],
        emergencyContact: { name: '', phone: '', relationship: '' }
      });
      setActiveTab('profile');
    } else {
      setAuthError(result.error || 'Registration failed');
    }

    setIsLoading(false);
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await authManager.logout();
      setCurrentUser(null);
      setActiveTab('chat');
      // Reset all states
      setCurrentAnalysis(null);
      setCurrentRiskAssessment(null);
      setCurrentSymptoms([]);
      setShowAuthModal(false);
      setAuthError('');
      setHasInteracted(false);
      setShowMobileMenu(false);
    } catch (error: unknown) {
      console.error('Logout error:', error);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInput(transcript);
    handleSend(transcript);
  };

  const handleSpeakResponse = (text: string) => {
    console.log('Speaking:', text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBack = () => {
    setScreenState({ currentScreen: "instructions" });
  };

  const handleEndChat = () => {
    setScreenState({ currentScreen: "finalScreen" });
  };

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setAuthError('');
    setShowMobileMenu(false);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setAuthError('');
    setLoginData({ email: '', password: '' });
    setRegisterData({
      email: '', password: '', confirmPassword: '', name: '', dateOfBirth: '', gender: '',
      allergies: [], medications: [], chronicConditions: [],
      emergencyContact: { name: '', phone: '', relationship: '' }
    });
  };

  const addItem = (type: 'allergies' | 'medications' | 'chronicConditions', value: string) => {
    if (!value.trim()) return;
    
    setRegisterData(prev => ({
      ...prev,
      [type]: [...prev[type], value.trim()]
    }));

    if (type === 'allergies') setNewAllergy('');
    if (type === 'medications') setNewMedication('');
    if (type === 'chronicConditions') setNewCondition('');
  };

  const removeItem = (type: 'allergies' | 'medications' | 'chronicConditions', index: number) => {
    setRegisterData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleTabChange = (tab: 'chat' | 'analytics' | 'profile' | 'history') => {
    setActiveTab(tab);
    setShowMobileMenu(false);
  };

  const renderAuthButtons = () => {
    if (currentUser) {
      return (
        <button
          onClick={handleLogout}
          className="relative z-50 bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-md transition-colors duration-200 cursor-pointer text-sm"
          title="Log out"
          style={{ 
            pointerEvents: 'auto',
            userSelect: 'none',
            WebkitUserSelect: 'none'
          }}
        >
          <LogOut className="size-3 sm:size-4" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      );
    }

    if (hasInteracted) {
      return (
        <div className="flex gap-1 sm:gap-2 relative z-50">
          <Button
            onClick={() => openAuthModal('register')}
            className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm h-auto"
            title="Register new account"
          >
            <UserPlus className="size-3 sm:size-4" />
            <span className="hidden sm:inline">Register</span>
          </Button>
          <Button
            onClick={() => openAuthModal('login')}
            className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm h-auto"
            title="Log in to existing account"
          >
            <LogIn className="size-3 sm:size-4" />
            <span className="hidden sm:inline">Log In</span>
          </Button>
        </div>
      );
    }

    return null;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return currentAnalysis && currentRiskAssessment ? (
          <div className="p-2 sm:p-4">
            <AdvancedAnalytics
              analysis={currentAnalysis}
              riskAssessment={currentRiskAssessment}
            />
          </div>
        ) : (
          <div className="p-4 text-center text-gray-400">
            <BarChart3 className="size-12 mx-auto mb-4 opacity-50" />
            <p>Start a conversation to see analytics</p>
          </div>
        );
      
      case 'profile':
        return (
          <UserProfile 
            onProfileUpdate={(profile) => setCurrentUser(prev => ({ ...prev, profile }))}
            onNavigateToLogin={() => openAuthModal('login')}
            onNavigateToRegister={() => openAuthModal('register')}
          />
        );
      
      case 'history':
        return <MedicalHistory />;
      
      default:
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%]",
                    message.sender === 'user' ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center",
                    message.sender === 'user' 
                      ? "bg-primary text-white" 
                      : "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  )}>
                    {message.sender === 'user' ? (
                      <User className="size-3 sm:size-4" />
                    ) : (
                      <Bot className="size-3 sm:size-4" />
                    )}
                  </div>
                  
                  <div className={cn(
                    "rounded-2xl px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm",
                    message.sender === 'user'
                      ? "bg-primary text-white rounded-br-md"
                      : "bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-bl-md border border-white/10"
                  )}>
                    <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    
                    {message.sender === 'ai' && message.riskAssessment && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          message.riskAssessment.riskLevel === 'critical' && "bg-red-500/20 text-red-300",
                          message.riskAssessment.riskLevel === 'high' && "bg-orange-500/20 text-orange-300",
                          message.riskAssessment.riskLevel === 'medium' && "bg-yellow-500/20 text-yellow-300",
                          message.riskAssessment.riskLevel === 'low' && "bg-green-500/20 text-green-300"
                        )}>
                          Risk: {message.riskAssessment.riskLevel} ({message.riskAssessment.riskScore}/100)
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2 sm:gap-3 max-w-[80%]">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center">
                    <Bot className="size-3 sm:size-4" />
                  </div>
                  <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-2xl rounded-bl-md px-3 py-2 sm:px-4 sm:py-3 border border-white/10">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <div className="text-xs opacity-70 mt-1">Analyzing symptoms...</div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Personalized Recommendations */}
            {currentSymptoms.length > 0 && currentAnalysis && currentRiskAssessment && (
              <div className="border-t border-white/10 p-2 sm:p-4">
                <PersonalizedRecommendations
                  currentSymptoms={currentSymptoms}
                  riskAssessment={currentRiskAssessment}
                  onNavigateToProfile={() => openAuthModal('register')}
                  onNavigateToLogin={() => openAuthModal('login')}
                />
              </div>
            )}

            {/* Input */}
            <div className="p-2 sm:p-4 border-t border-white/10 bg-black/20">
              <div className="flex gap-2 mb-2">
                <VoiceRecognition
                  onTranscript={handleVoiceTranscript}
                  onSpeakResponse={handleSpeakResponse}
                  disabled={isTyping}
                />
              </div>
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Describe your symptoms in detail..."
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base h-10 sm:h-11"
                  disabled={isTyping}
                  autoFocus
                />
                <Button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="px-3 sm:px-4 bg-primary hover:bg-primary/90 text-white h-10 sm:h-11"
                >
                  <Send className="size-3 sm:size-4" />
                </Button>
              </div>
              <p className="text-xs text-white/60 mt-2 text-center">
                Advanced AI analysis • Voice input supported • Personalized recommendations • Press Enter to send
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <DialogWrapper>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-2 sm:p-4 border-b border-white/10 bg-black/20 relative z-40">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleBack}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 w-8 h-8 sm:w-10 sm:h-10"
              >
                <ArrowLeft className="size-4 sm:size-5" />
              </Button>
              
              <div className="flex items-center gap-1 sm:gap-2">
                <Stethoscope className="size-4 sm:size-5 text-primary" />
                <h2 className="text-sm sm:text-lg font-semibold text-white">Advanced Medical AI</h2>
                {currentUser && (
                  <span className="text-xs sm:text-sm text-gray-400 hidden md:inline">
                    • {currentUser.profile?.name || currentUser.name || 'User'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 relative z-50">
              {/* Mobile Menu Button */}
              <Button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 w-8 h-8 sm:hidden"
              >
                <Menu className="size-4" />
              </Button>

              {/* Desktop Auth Buttons */}
              <div className="hidden sm:flex items-center gap-2">
                {renderAuthButtons()}
                <Button
                  onClick={handleEndChat}
                  variant="outline"
                  className="text-white border-white/30 hover:bg-white/10 text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
                >
                  End Chat
                </Button>
              </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {showMobileMenu && (
              <div className="absolute top-full right-2 mt-2 bg-gray-900 rounded-lg border border-white/20 shadow-lg z-50 min-w-[200px] sm:hidden">
                <div className="p-2 space-y-2">
                  {renderAuthButtons()}
                  <Button
                    onClick={handleEndChat}
                    variant="outline"
                    className="w-full text-white border-white/30 hover:bg-white/10 text-sm"
                  >
                    End Chat
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-white/10 bg-black/10 relative z-30 overflow-x-auto">
            {[
              { id: 'chat', icon: Bot, label: 'Chat' },
              { id: 'analytics', icon: BarChart3, label: 'Analytics' },
              { id: 'profile', icon: UserIcon, label: 'Profile' },
              { id: 'history', icon: History, label: 'History' }
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id as any)}
                className={cn(
                  "flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors relative z-10 whitespace-nowrap",
                  activeTab === id 
                    ? "text-primary border-b-2 border-primary bg-white/5" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="size-3 sm:size-4" />
                <span className="hidden xs:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden relative z-10">
            {renderTabContent()}
          </div>
        </div>
      </DialogWrapper>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-2 sm:p-4">
          <div className="bg-gray-900 rounded-lg border border-white/20 max-w-2xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  {authMode === 'login' ? (
                    <LogIn className="size-5 sm:size-6 text-blue-400" />
                  ) : (
                    <UserPlus className="size-5 sm:size-6 text-green-400" />
                  )}
                  <h3 className="text-lg sm:text-xl font-semibold text-white">
                    {authMode === 'login' ? 'Log In to Your Account' : 'Create New Account'}
                  </h3>
                </div>
                <Button
                  onClick={closeAuthModal}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10 w-8 h-8 sm:w-10 sm:h-10"
                >
                  <X className="size-4 sm:size-5" />
                </Button>
              </div>

              {authError && (
                <div className="p-3 bg-red-500/20 border border-red-400/30 rounded text-red-200 text-sm mb-4">
                  {authError}
                </div>
              )}

              {authMode === 'login' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Email Address</label>
                    <Input
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                      className="bg-white/10 border-white/20 text-white h-10 sm:h-11"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Password</label>
                    <Input
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter your password"
                      className="bg-white/10 border-white/20 text-white h-10 sm:h-11"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      onClick={handleLogin}
                      disabled={isLoading}
                      className="bg-blue-500 hover:bg-blue-600 text-white flex-1 h-10 sm:h-11"
                    >
                      {isLoading ? 'Logging in...' : 'Log In'}
                    </Button>
                    <Button
                      onClick={closeAuthModal}
                      variant="outline"
                      className="text-white border-white/30 hover:bg-white/10 h-10 sm:h-11"
                    >
                      Cancel
                    </Button>
                  </div>

                  <div className="text-center pt-4 border-t border-white/10">
                    <button
                      onClick={() => setAuthMode('register')}
                      className="text-green-400 hover:text-green-300 text-sm"
                    >
                      Don't have an account? Create one here
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h4 className="text-base sm:text-lg font-medium text-white border-b border-white/20 pb-2">Account Information</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Email Address *</label>
                        <Input
                          type="email"
                          value={registerData.email}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter your email"
                          className="bg-white/10 border-white/20 text-white h-10 sm:h-11"
                        />
                      </div>

                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Full Name *</label>
                        <Input
                          value={registerData.name}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter your full name"
                          className="bg-white/10 border-white/20 text-white h-10 sm:h-11"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Password *</label>
                        <Input
                          type="password"
                          value={registerData.password}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter password (min 6 characters)"
                          className="bg-white/10 border-white/20 text-white h-10 sm:h-11"
                        />
                      </div>

                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Confirm Password *</label>
                        <Input
                          type="password"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirm your password"
                          className="bg-white/10 border-white/20 text-white h-10 sm:h-11"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h4 className="text-base sm:text-lg font-medium text-white border-b border-white/20 pb-2">Personal Information</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Date of Birth</label>
                        <Input
                          type="date"
                          value={registerData.dateOfBirth}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                          className="bg-white/10 border-white/20 text-white h-10 sm:h-11"
                        />
                      </div>

                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Gender</label>
                        <select
                          value={registerData.gender}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, gender: e.target.value }))}
                          className="w-full h-10 sm:h-11 px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white text-sm"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Medical Information */}
                  <div className="space-y-4">
                    <h4 className="text-base sm:text-lg font-medium text-white border-b border-white/20 pb-2">Medical Information</h4>
                    
                    {/* Allergies */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Known Allergies</label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={newAllergy}
                          onChange={(e) => setNewAllergy(e.target.value)}
                          placeholder="Add allergy (e.g., Penicillin, Peanuts)"
                          className="bg-white/10 border-white/20 text-white h-9 sm:h-10"
                          onKeyPress={(e) => e.key === 'Enter' && addItem('allergies', newAllergy)}
                        />
                        <Button
                          onClick={() => addItem('allergies', newAllergy)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 h-9 sm:h-10 text-sm"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {registerData.allergies.map((allergy, index) => (
                          <div key={index} className="flex items-center gap-1 px-2 py-1 bg-red-500/20 border border-red-400/30 rounded text-red-200 text-sm">
                            {allergy}
                            <button onClick={() => removeItem('allergies', index)}>
                              <X className="size-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Medications */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Current Medications</label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={newMedication}
                          onChange={(e) => setNewMedication(e.target.value)}
                          placeholder="Add medication (include dosage if known)"
                          className="bg-white/10 border-white/20 text-white h-9 sm:h-10"
                          onKeyPress={(e) => e.key === 'Enter' && addItem('medications', newMedication)}
                        />
                        <Button
                          onClick={() => addItem('medications', newMedication)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 sm:px-3 h-9 sm:h-10 text-sm"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {registerData.medications.map((medication, index) => (
                          <div key={index} className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 border border-blue-400/30 rounded text-blue-200 text-sm">
                            {medication}
                            <button onClick={() => removeItem('medications', index)}>
                              <X className="size-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chronic Conditions */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Chronic Conditions</label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={newCondition}
                          onChange={(e) => setNewCondition(e.target.value)}
                          placeholder="Add chronic condition (e.g., Diabetes, Hypertension)"
                          className="bg-white/10 border-white/20 text-white h-9 sm:h-10"
                          onKeyPress={(e) => e.key === 'Enter' && addItem('chronicConditions', newCondition)}
                        />
                        <Button
                          onClick={() => addItem('chronicConditions', newCondition)}
                          className="bg-orange-500 hover:bg-orange-600 text-white px-2 sm:px-3 h-9 sm:h-10 text-sm"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {registerData.chronicConditions.map((condition, index) => (
                          <div key={index} className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 border border-orange-400/30 rounded text-orange-200 text-sm">
                            {condition}
                            <button onClick={() => removeItem('chronicConditions', index)}>
                              <X className="size-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="space-y-4">
                    <h4 className="text-base sm:text-lg font-medium text-white border-b border-white/20 pb-2">Emergency Contact (Optional)</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Contact Name</label>
                        <Input
                          value={registerData.emergencyContact.name}
                          onChange={(e) => setRegisterData(prev => ({
                            ...prev,
                            emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                          }))}
                          placeholder="Emergency contact name"
                          className="bg-white/10 border-white/20 text-white h-9 sm:h-10"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Phone Number</label>
                        <Input
                          type="tel"
                          value={registerData.emergencyContact.phone}
                          onChange={(e) => setRegisterData(prev => ({
                            ...prev,
                            emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                          }))}
                          placeholder="Emergency contact phone"
                          className="bg-white/10 border-white/20 text-white h-9 sm:h-10"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Relationship</label>
                        <Input
                          value={registerData.emergencyContact.relationship}
                          onChange={(e) => setRegisterData(prev => ({
                            ...prev,
                            emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                          }))}
                          placeholder="e.g., Spouse, Parent"
                          className="bg-white/10 border-white/20 text-white h-9 sm:h-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/10">
                    <Button
                      onClick={handleRegister}
                      disabled={isLoading}
                      className="bg-green-500 hover:bg-green-600 text-white flex-1 h-10 sm:h-11"
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                    <Button
                      onClick={closeAuthModal}
                      variant="outline"
                      className="text-white border-white/30 hover:bg-white/10 h-10 sm:h-11"
                    >
                      Cancel
                    </Button>
                  </div>

                  <div className="text-center pt-4 border-t border-white/10">
                    <button
                      onClick={() => setAuthMode('login')}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Already have an account? Log in here
                    </button>
                  </div>

                  <div className="text-xs text-gray-400 p-3 bg-white/5 rounded">
                    <p>* Required fields. All information is stored securely and privately.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};