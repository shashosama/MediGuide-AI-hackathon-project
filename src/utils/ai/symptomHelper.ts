// Enhanced symptom diagnosis with more comprehensive mapping and conversation flow
function diagnoseSymptom(symptom: string): string {
  const symptomLower = symptom.toLowerCase();
  
  // Comprehensive symptom to department mapping
  const mapping: { [key: string]: string } = {
    // Cardiology
    "chest pain": "Cardiology",
    "heart pain": "Cardiology", 
    "palpitations": "Cardiology",
    "irregular heartbeat": "Cardiology",
    "heart racing": "Cardiology",
    "chest tightness": "Cardiology",
    "chest pressure": "Cardiology",
    
    // Pulmonology
    "shortness of breath": "Pulmonology",
    "difficulty breathing": "Pulmonology",
    "wheezing": "Pulmonology",
    "cough": "Pulmonology",
    "chest congestion": "Pulmonology",
    "breathing problems": "Pulmonology",
    
    // Dermatology
    "rash": "Dermatology",
    "skin irritation": "Dermatology",
    "itchy skin": "Dermatology",
    "skin lesion": "Dermatology",
    "acne": "Dermatology",
    "eczema": "Dermatology",
    "psoriasis": "Dermatology",
    "mole": "Dermatology",
    
    // Neurology
    "headache": "Neurology",
    "migraine": "Neurology",
    "dizziness": "Neurology",
    "seizure": "Neurology",
    "numbness": "Neurology",
    "tingling": "Neurology",
    "memory loss": "Neurology",
    "confusion": "Neurology",
    
    // Orthopedics
    "back pain": "Orthopedics",
    "joint pain": "Orthopedics",
    "knee pain": "Orthopedics",
    "shoulder pain": "Orthopedics",
    "broken bone": "Orthopedics",
    "fracture": "Orthopedics",
    "sprain": "Orthopedics",
    "muscle pain": "Orthopedics",
    
    // Gastroenterology
    "stomach pain": "Gastroenterology",
    "abdominal pain": "Gastroenterology",
    "nausea": "Gastroenterology",
    "vomiting": "Gastroenterology",
    "diarrhea": "Gastroenterology",
    "constipation": "Gastroenterology",
    "heartburn": "Gastroenterology",
    "acid reflux": "Gastroenterology",
    
    // Ophthalmology
    "eye pain": "Ophthalmology",
    "vision problems": "Ophthalmology",
    "blurred vision": "Ophthalmology",
    "eye infection": "Ophthalmology",
    "red eyes": "Ophthalmology",
    
    // ENT (Ear, Nose, Throat)
    "ear pain": "ENT (Ear, Nose, Throat)",
    "sore throat": "ENT (Ear, Nose, Throat)",
    "hearing loss": "ENT (Ear, Nose, Throat)",
    "nasal congestion": "ENT (Ear, Nose, Throat)",
    "sinus pain": "ENT (Ear, Nose, Throat)",
    
    // Urology
    "urinary problems": "Urology",
    "kidney pain": "Urology",
    "bladder pain": "Urology",
    "frequent urination": "Urology",
    
    // Emergency/General Medicine
    "fever": "General Medicine",
    "fatigue": "General Medicine",
    "weakness": "General Medicine",
    "weight loss": "General Medicine",
    "night sweats": "General Medicine",
    "chills": "General Medicine",
  };

  // Check for exact matches first
  for (const [keyword, department] of Object.entries(mapping)) {
    if (symptomLower.includes(keyword)) {
      return department;
    }
  }

  // Emergency keywords that should go to Emergency Department
  const emergencyKeywords = [
    "severe", "intense", "unbearable", "emergency", "urgent", 
    "can't breathe", "chest crushing", "sudden", "acute"
  ];
  
  for (const keyword of emergencyKeywords) {
    if (symptomLower.includes(keyword)) {
      return "Emergency Department";
    }
  }

  return "General Medicine";
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
    return "I'm here to help you navigate healthcare by:\n\n• Analyzing your symptoms using advanced AI\n• Assessing risk levels and urgency\n• Recommending the most appropriate medical department\n• Providing personalized health guidance\n• Tracking your medical history\n\nSimply describe how you're feeling or any symptoms you're experiencing, and I'll provide comprehensive guidance. What would you like help with today?";
  }
  
  if (inputLower.includes('who are you')) {
    return "I'm an advanced AI medical assistant designed to help you navigate healthcare decisions. I use natural language processing and risk assessment to analyze your symptoms and guide you to the most appropriate medical department. I'm here to support you, but I don't replace professional medical diagnosis. How can I assist you today?";
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

export function handleSymptomInput(userSymptomText: string): string {
  // PRIORITY: Check for medical symptoms first (even if greeting is present)
  const hasMedicalSymptoms = containsMedicalSymptoms(userSymptomText);
  
  // If it has medical symptoms, proceed with medical analysis
  if (hasMedicalSymptoms) {
    const department = diagnoseSymptom(userSymptomText);
    const isContagious = isContagiousSymptom(userSymptomText);
    
    let responseText = `Thank you for sharing your symptoms with me. Based on what you've described, I recommend visiting our **${department}** department. `;
    
    // Add department-specific guidance
    switch (department) {
      case "Emergency Department":
        responseText += "Please seek immediate medical attention if you're experiencing severe symptoms.";
        break;
      case "Cardiology":
        responseText += "They specialize in heart and cardiovascular conditions.";
        break;
      case "Pulmonology":
        responseText += "They focus on respiratory and lung-related issues.";
        break;
      case "Dermatology":
        responseText += "They specialize in skin, hair, and nail conditions.";
        break;
      case "Neurology":
        responseText += "They focus on nervous system and brain-related conditions.";
        break;
      case "Orthopedics":
        responseText += "They specialize in bone, joint, and muscle conditions.";
        break;
      case "Gastroenterology":
        responseText += "They focus on digestive system and stomach-related issues.";
        break;
      default:
        responseText += "They can provide a comprehensive evaluation of your symptoms.";
    }
    
    // Add mask reminder for contagious symptoms
    if (isContagious) {
      responseText += "\n\n😷 **Safety Reminder**: Since you're experiencing symptoms that could be contagious, I strongly recommend wearing a mask when visiting the hospital to protect other patients and healthcare workers. This helps prevent the spread of infection and keeps everyone safe.";
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