import { departmentDatabase } from './departmentDatabase';
import { DiagnosisResult } from '@/types/medical';

export class MedicalDiagnosisEngine {
  private static instance: MedicalDiagnosisEngine;

  static getInstance(): MedicalDiagnosisEngine {
    if (!MedicalDiagnosisEngine.instance) {
      MedicalDiagnosisEngine.instance = new MedicalDiagnosisEngine();
    }
    return MedicalDiagnosisEngine.instance;
  }

  diagnoseSymptom(symptomText: string): DiagnosisResult {
    const symptomLower = symptomText.toLowerCase();
    let bestMatch = { department: 'generalMedicine', confidence: 0 };

    // Check each department for symptom matches
    for (const [deptKey, deptInfo] of Object.entries(departmentDatabase)) {
      let confidence = 0;
      let matchedSymptoms = 0;

      // Check for exact symptom matches
      for (const symptom of deptInfo.commonSymptoms) {
        if (symptomLower.includes(symptom.toLowerCase())) {
          confidence += 20;
          matchedSymptoms++;
        }
      }

      // Check for keyword matches
      const keywords = this.extractKeywords(symptomLower);
      for (const keyword of keywords) {
        for (const symptom of deptInfo.commonSymptoms) {
          if (symptom.toLowerCase().includes(keyword)) {
            confidence += 10;
          }
        }
      }

      // Emergency department gets priority for severe symptoms
      if (deptKey === 'emergency' && this.isSevereSymptom(symptomLower)) {
        confidence += 50;
      }

      // Age-based routing for pediatrics
      if (deptKey === 'pediatrics' && this.isChildRelated(symptomLower)) {
        confidence += 30;
      }

      if (confidence > bestMatch.confidence) {
        bestMatch = { department: deptKey, confidence };
      }
    }

    const selectedDept = departmentDatabase[bestMatch.department];
    
    return {
      department: selectedDept.name,
      confidence: Math.min(bestMatch.confidence, 100),
      reasoning: this.generateReasoning(symptomText, selectedDept),
      urgencyLevel: selectedDept.urgencyLevel,
      floor: selectedDept.floor,
      additionalInfo: this.generateAdditionalInfo(selectedDept)
    };
  }

  private extractKeywords(text: string): string[] {
    const medicalKeywords = [
      'pain', 'ache', 'hurt', 'sore', 'burning', 'stabbing', 'sharp', 'dull',
      'fever', 'temperature', 'hot', 'cold', 'chills', 'sweating',
      'nausea', 'vomiting', 'sick', 'dizzy', 'headache', 'migraine',
      'breathing', 'breath', 'cough', 'wheeze', 'congestion',
      'heart', 'chest', 'palpitations', 'racing', 'irregular',
      'joint', 'muscle', 'bone', 'back', 'neck', 'shoulder', 'knee',
      'rash', 'skin', 'itchy', 'red', 'swollen', 'bump', 'lump',
      'blood', 'bleeding', 'bruise', 'cut', 'wound', 'injury',
      'child', 'baby', 'infant', 'kid', 'pediatric', 'young'
    ];

    return text.toLowerCase()
      .split(/\s+/)
      .filter(word => medicalKeywords.includes(word.replace(/[^\w]/g, '')));
  }

  private isSevereSymptom(symptom: string): boolean {
    const severeKeywords = [
      'severe', 'intense', 'unbearable', 'crushing', 'stabbing',
      'can\'t breathe', 'difficulty breathing', 'unconscious',
      'bleeding heavily', 'heart attack', 'stroke', 'emergency',
      'urgent', 'critical', 'life threatening'
    ];

    return severeKeywords.some(keyword => symptom.includes(keyword));
  }

  private isChildRelated(symptom: string): boolean {
    const childKeywords = [
      'child', 'baby', 'infant', 'kid', 'toddler', 'pediatric',
      'young', 'my son', 'my daughter', 'years old', 'months old'
    ];

    return childKeywords.some(keyword => symptom.includes(keyword));
  }

  private generateReasoning(symptom: string, department: any): string {
    const reasons = [];
    
    if (department.urgencyLevel === 'emergency') {
      reasons.push("symptoms indicate potential emergency condition");
    }
    
    reasons.push(`symptoms align with ${department.name.toLowerCase()} specialization`);
    
    if (department.commonSymptoms.some(s => symptom.toLowerCase().includes(s.toLowerCase()))) {
      reasons.push("direct symptom match found");
    }

    return `Recommended because ${reasons.join(', ')}.`;
  }

  private generateAdditionalInfo(department: any): string {
    switch (department.urgencyLevel) {
      case 'emergency':
        return "Please seek immediate medical attention. If this is life-threatening, call 911.";
      case 'urgent':
        return "Please schedule an appointment as soon as possible or visit urgent care.";
      case 'routine':
        return "You can schedule a routine appointment during regular hours.";
      default:
        return "";
    }
  }
}

export const medicalDiagnosis = MedicalDiagnosisEngine.getInstance();