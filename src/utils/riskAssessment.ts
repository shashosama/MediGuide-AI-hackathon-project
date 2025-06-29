import { SymptomAnalysis } from './nlpProcessor';

export interface RiskAssessment {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // 0-100
  recommendations: string[];
  redFlags: string[];
  timeToSeek: 'immediately' | 'within_hours' | 'within_days' | 'routine';
}

export class RiskAssessmentEngine {
  private redFlagSymptoms = [
    'chest pain',
    'difficulty breathing',
    'severe headache',
    'loss of consciousness',
    'severe bleeding',
    'severe allergic reaction',
    'stroke symptoms',
    'heart attack symptoms',
    'can\'t breathe',
    'crushing pain',
    'sudden severe pain'
  ];

  private criticalCombinations = [
    ['chest pain', 'shortness of breath'],
    ['chest pain', 'difficulty breathing'],
    ['severe headache', 'vision changes'],
    ['abdominal pain', 'vomiting blood'],
    ['fever', 'stiff neck'],
    ['confusion', 'severe headache']
  ];

  assessRisk(analysis: SymptomAnalysis): RiskAssessment {
    let riskScore = 0;
    const recommendations: string[] = [];
    const redFlags: string[] = [];

    // Base risk from severity
    switch (analysis.severity) {
      case 'critical':
        riskScore += 40;
        break;
      case 'severe':
        riskScore += 30;
        break;
      case 'moderate':
        riskScore += 15;
        break;
      case 'mild':
        riskScore += 5;
        break;
    }

    // Risk from urgency
    switch (analysis.urgency) {
      case 'emergency':
        riskScore += 35;
        break;
      case 'high':
        riskScore += 25;
        break;
      case 'medium':
        riskScore += 10;
        break;
      case 'low':
        riskScore += 0;
        break;
    }

    // Check for red flag symptoms
    analysis.symptoms.forEach(symptom => {
      if (this.redFlagSymptoms.some(redFlag => symptom.includes(redFlag))) {
        riskScore += 20;
        redFlags.push(symptom);
      }
    });

    // Check for critical combinations
    this.criticalCombinations.forEach(combination => {
      if (combination.every(symptom => 
        analysis.symptoms.some(userSymptom => userSymptom.includes(symptom))
      )) {
        riskScore += 25;
        redFlags.push(`Critical combination: ${combination.join(' + ')}`);
      }
    });

    // Sentiment impact (negative sentiment might indicate distress)
    if (analysis.sentiment.score < -2) {
      riskScore += 10;
    }

    // Cap at 100
    riskScore = Math.min(riskScore, 100);

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    let timeToSeek: 'immediately' | 'within_hours' | 'within_days' | 'routine';

    if (riskScore >= 70) {
      riskLevel = 'critical';
      timeToSeek = 'immediately';
      recommendations.push('Seek emergency medical attention immediately');
      recommendations.push('Call 911 or go to the nearest emergency room');
      recommendations.push('Do not drive yourself - have someone else drive or call an ambulance');
    } else if (riskScore >= 50) {
      riskLevel = 'high';
      timeToSeek = 'within_hours';
      recommendations.push('Seek medical attention within the next few hours');
      recommendations.push('Contact your doctor or visit urgent care');
      recommendations.push('Monitor symptoms closely and seek immediate care if they worsen');
    } else if (riskScore >= 25) {
      riskLevel = 'medium';
      timeToSeek = 'within_days';
      recommendations.push('Schedule an appointment with your doctor within 1-2 days');
      recommendations.push('Monitor symptoms and seek care if they worsen');
      recommendations.push('Consider over-the-counter remedies if appropriate');
    } else {
      riskLevel = 'low';
      timeToSeek = 'routine';
      recommendations.push('Consider scheduling a routine appointment');
      recommendations.push('Monitor symptoms and practice self-care');
      recommendations.push('Seek care if symptoms persist or worsen');
    }

    return {
      riskLevel,
      riskScore,
      recommendations,
      redFlags,
      timeToSeek
    };
  }
}

export const riskAssessmentEngine = new RiskAssessmentEngine();