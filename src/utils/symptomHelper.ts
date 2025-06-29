import { medicalDiagnosis } from './medicalDiagnosis';

// Enhanced symptom diagnosis with comprehensive department mapping
export function handleSymptomInput(userSymptomText: string): string {
  // Check if input contains actual medical symptoms
  const hasMedicalSymptoms = containsMedicalSymptoms(userSymptomText);
  
  // If it has medical symptoms, proceed with medical analysis
  if (hasMedicalSymptoms) {
    const diagnosis = medicalDiagnosis.diagnoseSymptom(userSymptomText);
    
    let responseText = `Thank you for sharing your symptoms with me. Based on what you've described, I recommend visiting our **${diagnosis.department}**. `;
    
    responseText += `They are located on the ${diagnosis.floor}. `;
    responseText += diagnosis.reasoning + ' ';
    
    if (diagnosis.additionalInfo) {
      responseText += diagnosis.additionalInfo + ' ';
    }
    
    responseText += "\n\n⚠️ **Important**: This is general guidance based on AI analysis, and it's important to consult with a healthcare professional for proper diagnosis and treatment.";
    
    console.log(responseText);
    return responseText;
  }
  
  // Only if it's a pure greeting with no medical content
  if (isPureGreeting(userSymptomText)) {
    return generateGreetingResponse(userSymptomText);
  }
  
  // For other non-medical inputs
  return "I understand you'd like to chat! I'm specifically designed to help with medical symptoms and health concerns. If you're experiencing any symptoms or have health questions, please feel free to describe them and I'll provide appropriate guidance. Otherwise, how are you feeling today?";
}

// Check if input contains actual medical symptoms
function containsMedicalSymptoms(input: string): boolean {
  const medicalKeywords = [
    'pain', 'ache', 'hurt', 'sore', 'burning', 'fever', 'nausea', 'vomiting',
    'cough', 'headache', 'dizziness', 'rash', 'swelling', 'bleeding',
    'difficulty', 'shortness', 'chest', 'stomach', 'back', 'joint',
    'symptom', 'sick', 'ill', 'feel', 'experiencing', 'having trouble',
    'tired', 'fatigue', 'weak', 'dizzy', 'numb', 'tingling', 'cramps',
    'infection', 'inflammation', 'bruise', 'cut', 'wound', 'injury'
  ];
  
  const inputLower = input.toLowerCase();
  return medicalKeywords.some(keyword => inputLower.includes(keyword));
}

// Check if input is ONLY a greeting (no medical content)
function isPureGreeting(input: string): boolean {
  const pureGreetingPatterns = [
    /^(hi|hello|hey|good morning|good afternoon|good evening)$/i,
    /^(how are you|what's up|what can you do|who are you)$/i,
    /^(thanks|thank you|bye|goodbye|see you)$/i,
    /^(yes|no|okay|ok|sure|alright)$/i,
    /^(help|what|how)$/i
  ];
  
  const inputLower = input.toLowerCase().trim();
  
  // If it contains medical symptoms, it's not a pure greeting
  if (containsMedicalSymptoms(input)) {
    return false;
  }
  
  // Check if it matches pure greeting patterns
  return pureGreetingPatterns.some(pattern => pattern.test(inputLower));
}

// Generate appropriate greeting responses
function generateGreetingResponse(input: string): string {
  const inputLower = input.toLowerCase().trim();
  
  if (inputLower.includes('hi') || inputLower.includes('hello') || inputLower.includes('hey')) {
    return "Hello! I'm your AI medical assistant. I'm here to help guide you to the right medical department based on your symptoms. How are you feeling today? Please feel free to describe any symptoms or health concerns you might have.";
  }
  
  if (inputLower.includes('how are you')) {
    return "Thank you for asking! I'm doing well and ready to help you with any health concerns. I'm designed to analyze symptoms and provide guidance on which medical department would be most appropriate for your needs. What brings you here today?";
  }
  
  if (inputLower.includes('what can you do') || inputLower.includes('help')) {
    return "I'm here to help you navigate healthcare by:\n\n• Analyzing your symptoms using advanced AI\n• Assessing risk levels and urgency\n• Recommending the most appropriate medical department\n• Providing information about department locations and waiting times\n• Offering directions within the hospital\n\nSimply describe how you're feeling or any symptoms you're experiencing, and I'll provide comprehensive guidance. What would you like help with today?";
  }
  
  if (inputLower.includes('who are you')) {
    return "I'm an advanced AI medical assistant designed to help you navigate healthcare decisions. I use natural language processing and medical knowledge to analyze your symptoms and guide you to the most appropriate medical department. I'm here to support you, but I don't replace professional medical diagnosis. How can I assist you today?";
  }
  
  if (inputLower.includes('thank') || inputLower.includes('thanks')) {
    return "You're very welcome! I'm glad I could help. If you have any other health concerns or questions, please don't hesitate to ask. Your health and well-being are important, and I'm here whenever you need guidance.";
  }
  
  if (inputLower.includes('bye') || inputLower.includes('goodbye')) {
    return "Goodbye! Take care of yourself, and remember that I'm here whenever you need medical guidance. Don't hesitate to return if you have any health concerns. Wishing you good health!";
  }
  
  // Default friendly response for other casual inputs
  return "I'm here to help you with any health concerns or symptoms you might be experiencing. Feel free to describe how you're feeling, and I'll provide guidance on the best medical department for your needs. What can I help you with today?";
}

// Utility function to check if symptoms are contagious
export function isContagiousSymptom(symptom: string): boolean {
  const contagiousKeywords = [
    'flu', 'fever', 'cough', 'cold', 'sore throat', 'runny nose',
    'sneezing', 'congestion', 'chills', 'body aches', 'headache',
    'respiratory', 'breathing', 'pneumonia', 'bronchitis', 'covid',
    'coronavirus', 'viral', 'infection', 'contagious', 'sick'
  ];
  
  const symptomLower = symptom.toLowerCase();
  return contagiousKeywords.some(keyword => symptomLower.includes(keyword));
}