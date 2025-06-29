export enum ConversationStatus {
  ACTIVE = "active",
  ENDED = "ended",
  ERROR = "error",
}

export type IConversation = {
  conversation_id: string;
  conversation_name: string;
  status: ConversationStatus;
  conversation_url: string;
  created_at: string;
};

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