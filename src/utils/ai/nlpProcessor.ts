// Simple NLP processor without external dependencies
export interface SymptomAnalysis {
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  bodyParts: string[];
  duration: string | null;
  sentiment: {
    score: number;
    comparative: number;
    positive: string[];
    negative: string[];
  };
  entities: {
    people: string[];
    places: string[];
    organizations: string[];
  };
}

export class NLPProcessor {
  private severityKeywords = {
    critical: ['unbearable', 'excruciating', 'severe', 'intense', 'crushing', 'stabbing', 'sharp', 'worst'],
    severe: ['bad', 'terrible', 'awful', 'horrible', 'strong', 'heavy', 'serious'],
    moderate: ['uncomfortable', 'bothersome', 'noticeable', 'persistent', 'concerning'],
    mild: ['slight', 'minor', 'little', 'small', 'light', 'gentle']
  };

  private urgencyKeywords = {
    emergency: ['can\'t breathe', 'chest pain', 'unconscious', 'bleeding heavily', 'severe allergic reaction', 'heart attack', 'stroke'],
    high: ['difficulty breathing', 'severe pain', 'high fever', 'vomiting blood', 'sudden', 'acute'],
    medium: ['persistent', 'worsening', 'spreading', 'recurring', 'getting worse'],
    low: ['mild', 'occasional', 'minor', 'slight', 'sometimes']
  };

  private bodyParts = [
    'head', 'neck', 'chest', 'back', 'arm', 'leg', 'hand', 'foot', 'stomach', 'abdomen',
    'throat', 'eye', 'ear', 'nose', 'mouth', 'tooth', 'teeth', 'skin', 'joint', 'muscle', 'bone',
    'heart', 'lung', 'kidney', 'liver', 'brain', 'shoulder', 'knee', 'ankle', 'wrist', 'elbow'
  ];

  private symptomKeywords = [
    'pain', 'ache', 'hurt', 'sore', 'tender', 'burning', 'stinging', 'throbbing',
    'fever', 'chills', 'sweating', 'nausea', 'vomiting', 'diarrhea', 'constipation',
    'cough', 'sneeze', 'congestion', 'runny nose', 'sore throat', 'hoarse',
    'headache', 'dizziness', 'fatigue', 'weakness', 'tired', 'exhausted',
    'rash', 'itching', 'swelling', 'bruising', 'bleeding', 'cut', 'wound',
    'difficulty breathing', 'shortness of breath', 'wheezing', 'chest tightness'
  ];

  private positiveWords = ['good', 'better', 'fine', 'okay', 'well', 'healthy', 'normal', 'improving'];
  private negativeWords = ['bad', 'worse', 'terrible', 'awful', 'sick', 'ill', 'painful', 'horrible', 'worried', 'scared'];

  analyzeSymptoms(text: string): SymptomAnalysis {
    const lowerText = text.toLowerCase();
    
    // Extract symptoms
    const symptoms = this.extractSymptoms(lowerText);
    
    // Analyze severity
    const severity = this.analyzeSeverity(lowerText);
    
    // Analyze urgency
    const urgency = this.analyzeUrgency(lowerText);
    
    // Extract body parts mentioned
    const bodyParts = this.extractBodyParts(lowerText);
    
    // Extract duration
    const duration = this.extractDuration(lowerText);
    
    // Simple sentiment analysis
    const sentiment = this.analyzeSentiment(lowerText);
    
    // Extract basic entities (simplified)
    const entities = this.extractEntities(text);

    return {
      symptoms,
      severity,
      urgency,
      bodyParts,
      duration,
      sentiment,
      entities
    };
  }

  private extractSymptoms(text: string): string[] {
    const symptoms: string[] = [];
    
    this.symptomKeywords.forEach(symptom => {
      if (text.includes(symptom)) {
        symptoms.push(symptom);
      }
    });

    return [...new Set(symptoms)]; // Remove duplicates
  }

  private analyzeSeverity(text: string): 'mild' | 'moderate' | 'severe' | 'critical' {
    for (const [level, keywords] of Object.entries(this.severityKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return level as 'mild' | 'moderate' | 'severe' | 'critical';
      }
    }
    
    return 'moderate'; // Default
  }

  private analyzeUrgency(text: string): 'low' | 'medium' | 'high' | 'emergency' {
    for (const [level, keywords] of Object.entries(this.urgencyKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return level as 'low' | 'medium' | 'high' | 'emergency';
      }
    }
    
    return 'medium'; // Default
  }

  private extractBodyParts(text: string): string[] {
    return this.bodyParts.filter(part => text.includes(part));
  }

  private extractDuration(text: string): string | null {
    // Look for common duration patterns
    const durationPatterns = [
      /(\d+)\s*(day|week|month|year|hour|minute)s?/i,
      /(since|for|about|around)\s+(\w+)/i,
      /(yesterday|today|this morning|last night|few days|several days)/i
    ];
    
    for (const pattern of durationPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }
    
    return null;
  }

  private analyzeSentiment(text: string): any {
    let score = 0;
    const words = text.split(/\s+/);
    const positive: string[] = [];
    const negative: string[] = [];

    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      
      if (this.positiveWords.includes(cleanWord)) {
        score += 1;
        positive.push(cleanWord);
      } else if (this.negativeWords.includes(cleanWord)) {
        score -= 1;
        negative.push(cleanWord);
      }
    });

    return {
      score,
      comparative: score / words.length,
      positive,
      negative
    };
  }

  private extractEntities(text: string): any {
    // Simplified entity extraction
    const words = text.split(/\s+/);
    const entities = {
      people: [] as string[],
      places: [] as string[],
      organizations: [] as string[]
    };

    // Look for capitalized words that might be names
    words.forEach(word => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (cleanWord.length > 2 && cleanWord[0] === cleanWord[0].toUpperCase()) {
        // Simple heuristic: if it's not a common word, might be a name
        const commonWords = ['I', 'The', 'This', 'That', 'My', 'Your', 'His', 'Her', 'Our', 'Their'];
        if (!commonWords.includes(cleanWord)) {
          entities.people.push(cleanWord);
        }
      }
    });

    return entities;
  }
}

export const nlpProcessor = new NLPProcessor();