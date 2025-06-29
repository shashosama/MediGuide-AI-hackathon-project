import { formatDate } from './dateUtils';

export interface UserProfile {
  id: string;
  name: string;
  age?: number;
  dateOfBirth?: string;
  gender?: string;
  allergies: string[];
  medications: string[];
  chronicConditions: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: Date;
  lastUpdated: Date;
}

export interface MedicalHistory {
  id: string;
  userId: string;
  date: Date;
  symptoms: string[];
  diagnosis?: string;
  department: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  notes: string;
  followUpRequired: boolean;
  followUpDate?: Date;
}

export interface PersonalizedRecommendation {
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  basedOn: string[];
  actionRequired: boolean;
}

export class UserDataManager {
  private static instance: UserDataManager;
  private readonly STORAGE_PREFIX = 'medical_assistant_';

  static getInstance(): UserDataManager {
    if (!UserDataManager.instance) {
      UserDataManager.instance = new UserDataManager();
    }
    return UserDataManager.instance;
  }

  // User Profile Management
  createUserProfile(userData: Partial<UserProfile>): UserProfile {
    const profile: UserProfile = {
      id: this.generateUserId(),
      name: userData.name || 'Anonymous User',
      age: userData.age,
      dateOfBirth: userData.dateOfBirth,
      gender: userData.gender,
      allergies: userData.allergies || [],
      medications: userData.medications || [],
      chronicConditions: userData.chronicConditions || [],
      emergencyContact: userData.emergencyContact,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    this.saveUserProfile(profile);
    return profile;
  }

  getUserProfile(userId?: string): UserProfile | null {
    const id = userId || this.getCurrentUserId();
    if (!id) return null;

    const stored = localStorage.getItem(`${this.STORAGE_PREFIX}profile_${id}`);
    if (!stored) return null;

    const profile = JSON.parse(stored);
    profile.createdAt = new Date(profile.createdAt);
    profile.lastUpdated = new Date(profile.lastUpdated);
    return profile;
  }

  updateUserProfile(updates: Partial<UserProfile>): UserProfile | null {
    const currentProfile = this.getUserProfile();
    if (!currentProfile) return null;

    const updatedProfile = {
      ...currentProfile,
      ...updates,
      lastUpdated: new Date()
    };

    this.saveUserProfile(updatedProfile);
    return updatedProfile;
  }

  private saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(`${this.STORAGE_PREFIX}profile_${profile.id}`, JSON.stringify(profile));
    localStorage.setItem(`${this.STORAGE_PREFIX}current_user`, profile.id);
  }

  // Medical History Management
  addMedicalRecord(record: Omit<MedicalHistory, 'id' | 'userId'>): MedicalHistory {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error('No active user found');

    const medicalRecord: MedicalHistory = {
      id: this.generateRecordId(),
      userId,
      ...record,
      date: new Date(record.date)
    };

    const history = this.getMedicalHistory();
    history.push(medicalRecord);
    this.saveMedicalHistory(history);

    return medicalRecord;
  }

  getMedicalHistory(userId?: string): MedicalHistory[] {
    const id = userId || this.getCurrentUserId();
    if (!id) return [];

    const stored = localStorage.getItem(`${this.STORAGE_PREFIX}history_${id}`);
    if (!stored) return [];

    const history = JSON.parse(stored);
    return history.map((record: any) => ({
      ...record,
      date: new Date(record.date),
      followUpDate: record.followUpDate ? new Date(record.followUpDate) : undefined
    }));
  }

  private saveMedicalHistory(history: MedicalHistory[]): void {
    const userId = this.getCurrentUserId();
    if (!userId) return;

    localStorage.setItem(`${this.STORAGE_PREFIX}history_${userId}`, JSON.stringify(history));
  }

  // Personalized Recommendations
  generatePersonalizedAdvice(currentSymptoms: string[], riskLevel: string, riskScore: number): PersonalizedRecommendation[] {
    const profile = this.getUserProfile();
    const history = this.getMedicalHistory();
    const recommendations: PersonalizedRecommendation[] = [];

    if (!profile) {
      recommendations.push({
        message: "Consider creating a user profile to receive personalized medical guidance based on your history.",
        priority: 'low',
        basedOn: ['No profile found'],
        actionRequired: false
      });
      return recommendations;
    }

    // Check for recurring symptoms
    const recentHistory = history.filter(record => {
      const daysDiff = (new Date().getTime() - record.date.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 30; // Last 30 days
    });

    const recurringSymptoms = this.findRecurringSymptoms(currentSymptoms, recentHistory);
    if (recurringSymptoms.length > 0) {
      recommendations.push({
        message: `You've experienced similar symptoms recently: ${recurringSymptoms.join(', ')}. Consider discussing this pattern with your doctor for a comprehensive evaluation.`,
        priority: 'medium',
        basedOn: ['Medical history pattern'],
        actionRequired: true
      });
    }

    // Check medication interactions
    if (profile.medications.length > 0) {
      const potentialInteractions = this.checkMedicationInteractions(currentSymptoms, profile.medications);
      if (potentialInteractions.length > 0) {
        recommendations.push({
          message: `Your current medications (${profile.medications.join(', ')}) may be relevant to your symptoms. Please inform your healthcare provider about all medications you're taking.`,
          priority: 'high',
          basedOn: ['Current medications'],
          actionRequired: true
        });
      }
    }

    // Check allergies
    if (profile.allergies.length > 0) {
      recommendations.push({
        message: `Remember to inform healthcare providers about your known allergies: ${profile.allergies.join(', ')}.`,
        priority: 'medium',
        basedOn: ['Known allergies'],
        actionRequired: false
      });
    }

    // Chronic condition considerations
    if (profile.chronicConditions.length > 0) {
      const relevantConditions = this.checkChronicConditionRelevance(currentSymptoms, profile.chronicConditions);
      if (relevantConditions.length > 0) {
        recommendations.push({
          message: `Your chronic conditions (${relevantConditions.join(', ')}) may be related to your current symptoms. Consider consulting your specialist.`,
          priority: 'high',
          basedOn: ['Chronic conditions'],
          actionRequired: true
        });
      }
    }

    // Age-specific recommendations
    if (profile.age) {
      const ageRecommendations = this.getAgeSpecificRecommendations(profile.age, currentSymptoms, riskLevel);
      recommendations.push(...ageRecommendations);
    }

    // Follow-up reminders
    const overdueFollowUps = history.filter(record => 
      record.followUpRequired && 
      record.followUpDate && 
      record.followUpDate < new Date()
    );

    if (overdueFollowUps.length > 0) {
      recommendations.push({
        message: `You have ${overdueFollowUps.length} overdue follow-up appointment(s). Please schedule these as soon as possible.`,
        priority: 'urgent',
        basedOn: ['Overdue follow-ups'],
        actionRequired: true
      });
    }

    return recommendations;
  }

  // Analytics and Insights
  getHealthInsights(): any {
    const history = this.getMedicalHistory();
    const profile = this.getUserProfile();

    if (history.length === 0) return null;

    const insights = {
      totalVisits: history.length,
      mostCommonSymptoms: this.getMostCommonSymptoms(history),
      riskTrends: this.getRiskTrends(history),
      departmentFrequency: this.getDepartmentFrequency(history),
      averageRiskScore: this.getAverageRiskScore(history),
      lastVisit: history[history.length - 1]?.date,
      healthScore: this.calculateHealthScore(history, profile)
    };

    return insights;
  }

  private findRecurringSymptoms(currentSymptoms: string[], history: MedicalHistory[]): string[] {
    const recurring: string[] = [];
    
    currentSymptoms.forEach(symptom => {
      const occurrences = history.filter(record => 
        record.symptoms.some(s => s.toLowerCase().includes(symptom.toLowerCase()))
      ).length;
      
      if (occurrences >= 2) {
        recurring.push(symptom);
      }
    });

    return recurring;
  }

  private checkMedicationInteractions(symptoms: string[], medications: string[]): string[] {
    // Simplified medication interaction check
    const interactions: string[] = [];
    
    // Common medication side effects that might relate to symptoms
    const medicationEffects: { [key: string]: string[] } = {
      'aspirin': ['stomach pain', 'nausea', 'bleeding'],
      'ibuprofen': ['stomach pain', 'headache', 'dizziness'],
      'acetaminophen': ['nausea', 'liver pain'],
      'blood pressure medication': ['dizziness', 'fatigue', 'headache'],
      'antidepressant': ['nausea', 'dizziness', 'headache', 'fatigue']
    };

    medications.forEach(med => {
      const medLower = med.toLowerCase();
      Object.keys(medicationEffects).forEach(medType => {
        if (medLower.includes(medType)) {
          const effects = medicationEffects[medType];
          const matchingSymptoms = symptoms.filter(symptom => 
            effects.some(effect => symptom.toLowerCase().includes(effect))
          );
          if (matchingSymptoms.length > 0) {
            interactions.push(med);
          }
        }
      });
    });

    return interactions;
  }

  private checkChronicConditionRelevance(symptoms: string[], conditions: string[]): string[] {
    const relevant: string[] = [];
    
    const conditionSymptoms: { [key: string]: string[] } = {
      'diabetes': ['fatigue', 'thirst', 'frequent urination', 'blurred vision'],
      'hypertension': ['headache', 'dizziness', 'chest pain'],
      'asthma': ['shortness of breath', 'wheezing', 'cough', 'chest tightness'],
      'arthritis': ['joint pain', 'stiffness', 'swelling'],
      'heart disease': ['chest pain', 'shortness of breath', 'fatigue', 'palpitations']
    };

    conditions.forEach(condition => {
      const conditionLower = condition.toLowerCase();
      Object.keys(conditionSymptoms).forEach(condType => {
        if (conditionLower.includes(condType)) {
          const relatedSymptoms = conditionSymptoms[condType];
          const hasRelatedSymptoms = symptoms.some(symptom => 
            relatedSymptoms.some(related => symptom.toLowerCase().includes(related))
          );
          if (hasRelatedSymptoms) {
            relevant.push(condition);
          }
        }
      });
    });

    return relevant;
  }

  private getAgeSpecificRecommendations(age: number, symptoms: string[], riskLevel: string): PersonalizedRecommendation[] {
    const recommendations: PersonalizedRecommendation[] = [];

    if (age >= 65) {
      recommendations.push({
        message: "As a senior, consider bringing a family member or caregiver to your appointment for support and to help remember important information.",
        priority: 'medium',
        basedOn: ['Age consideration'],
        actionRequired: false
      });

      if (riskLevel === 'high' || riskLevel === 'critical') {
        recommendations.push({
          message: "Given your age and symptom severity, consider seeking immediate medical attention rather than waiting.",
          priority: 'urgent',
          basedOn: ['Age and risk level'],
          actionRequired: true
        });
      }
    }

    if (age < 18) {
      recommendations.push({
        message: "As a minor, ensure a parent or guardian accompanies you to any medical appointments.",
        priority: 'high',
        basedOn: ['Age requirement'],
        actionRequired: true
      });
    }

    return recommendations;
  }

  private getMostCommonSymptoms(history: MedicalHistory[]): { symptom: string; count: number }[] {
    const symptomCounts: { [key: string]: number } = {};
    
    history.forEach(record => {
      record.symptoms.forEach(symptom => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    });

    return Object.entries(symptomCounts)
      .map(([symptom, count]) => ({ symptom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getRiskTrends(history: MedicalHistory[]): any {
    const last6Months = history.filter(record => {
      const monthsDiff = (new Date().getTime() - record.date.getTime()) / (1000 * 3600 * 24 * 30);
      return monthsDiff <= 6;
    });

    return last6Months.map(record => ({
      date: formatDate(record.date, 'MMM yyyy'),
      riskScore: record.riskScore,
      riskLevel: record.riskLevel
    }));
  }

  private getDepartmentFrequency(history: MedicalHistory[]): { [department: string]: number } {
    const frequency: { [department: string]: number } = {};
    
    history.forEach(record => {
      frequency[record.department] = (frequency[record.department] || 0) + 1;
    });

    return frequency;
  }

  private getAverageRiskScore(history: MedicalHistory[]): number {
    if (history.length === 0) return 0;
    
    const totalScore = history.reduce((sum, record) => sum + record.riskScore, 0);
    return Math.round(totalScore / history.length);
  }

  private calculateHealthScore(history: MedicalHistory[], profile: UserProfile | null): number {
    let score = 100; // Start with perfect health score

    // Deduct points for recent high-risk visits
    const recentHighRisk = history.filter(record => {
      const daysDiff = (new Date().getTime() - record.date.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 30 && (record.riskLevel === 'high' || record.riskLevel === 'critical');
    });
    score -= recentHighRisk.length * 10;

    // Deduct points for chronic conditions
    if (profile?.chronicConditions.length) {
      score -= profile.chronicConditions.length * 5;
    }

    // Deduct points for overdue follow-ups
    const overdueFollowUps = history.filter(record => 
      record.followUpRequired && 
      record.followUpDate && 
      record.followUpDate < new Date()
    );
    score -= overdueFollowUps.length * 15;

    return Math.max(0, Math.min(100, score));
  }

  // Utility methods
  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRecordId(): string {
    return `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string | null {
    return localStorage.getItem(`${this.STORAGE_PREFIX}current_user`);
  }

  // Export/Import functionality
  exportUserData(): string {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error('No active user found');

    const profile = this.getUserProfile(userId);
    const history = this.getMedicalHistory(userId);

    return JSON.stringify({
      profile,
      history,
      exportDate: new Date(),
      version: '1.0'
    }, null, 2);
  }

  importUserData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.profile) {
        this.saveUserProfile(data.profile);
      }
      
      if (data.history) {
        this.saveMedicalHistory(data.history);
      }

      return true;
    } catch (error) {
      console.error('Failed to import user data:', error);
      return false;
    }
  }

  // Clear all user data
  clearAllUserData(): void {
    const userId = this.getCurrentUserId();
    if (!userId) return;

    localStorage.removeItem(`${this.STORAGE_PREFIX}profile_${userId}`);
    localStorage.removeItem(`${this.STORAGE_PREFIX}history_${userId}`);
    localStorage.removeItem(`${this.STORAGE_PREFIX}current_user`);
  }
}

export const userDataManager = UserDataManager.getInstance();