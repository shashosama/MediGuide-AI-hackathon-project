export interface DepartmentInfo {
  name: string;
  floor: string;
  description: string;
  commonSymptoms: string[];
  urgencyLevel: 'emergency' | 'urgent' | 'routine';
}

export interface DiagnosisResult {
  department: string;
  confidence: number;
  reasoning: string;
  urgencyLevel: 'emergency' | 'urgent' | 'routine';
  floor: string;
  additionalInfo?: string;
}

export interface ToolCallEvent {
  tool_name: string;
  parameters: Record<string, any>;
}

export interface UtteranceEvent {
  transcript: string;
  confidence: number;
}