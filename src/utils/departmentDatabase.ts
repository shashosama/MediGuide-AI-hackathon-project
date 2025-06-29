import { DepartmentInfo } from '@/types/medical';

export const departmentDatabase: Record<string, DepartmentInfo> = {
  emergency: {
    name: "Emergency Department",
    floor: "Ground Floor",
    description: "For immediate, life-threatening conditions requiring urgent medical attention",
    commonSymptoms: [
      "severe chest pain", "difficulty breathing", "unconsciousness", "severe bleeding",
      "heart attack symptoms", "stroke symptoms", "severe allergic reaction",
      "severe burns", "major trauma", "poisoning"
    ],
    urgencyLevel: 'emergency'
  },
  cardiology: {
    name: "Cardiology Department",
    floor: "Third Floor",
    description: "Specializes in heart and cardiovascular conditions",
    commonSymptoms: [
      "chest pain", "heart palpitations", "shortness of breath", "irregular heartbeat",
      "high blood pressure", "chest tightness", "heart murmur", "swollen ankles",
      "fatigue with exertion", "dizziness"
    ],
    urgencyLevel: 'urgent'
  },
  orthopedics: {
    name: "Orthopedics Department",
    floor: "Second Floor",
    description: "Treats bone, joint, and muscle conditions",
    commonSymptoms: [
      "joint pain", "back pain", "broken bone", "muscle pain", "arthritis",
      "sports injury", "knee pain", "shoulder pain", "hip pain", "neck pain",
      "sprain", "fracture", "mobility issues"
    ],
    urgencyLevel: 'routine'
  },
  neurology: {
    name: "Neurology Department",
    floor: "Fourth Floor",
    description: "Specializes in brain, spine, and nervous system disorders",
    commonSymptoms: [
      "headache", "migraine", "seizure", "memory loss", "confusion",
      "numbness", "tingling", "weakness", "tremor", "balance problems",
      "speech difficulties", "vision problems"
    ],
    urgencyLevel: 'urgent'
  },
  pediatrics: {
    name: "Pediatrics Department",
    floor: "Fifth Floor",
    description: "Specialized care for infants, children, and adolescents",
    commonSymptoms: [
      "fever in child", "child not eating", "developmental concerns", "vaccination",
      "growth problems", "behavioral issues", "school problems", "child injury"
    ],
    urgencyLevel: 'routine'
  },
  oncology: {
    name: "Oncology Department",
    floor: "Sixth Floor",
    description: "Cancer diagnosis, treatment, and care",
    commonSymptoms: [
      "unexplained weight loss", "persistent fatigue", "unusual lumps",
      "changes in moles", "persistent cough", "blood in stool", "night sweats",
      "cancer screening", "family history of cancer"
    ],
    urgencyLevel: 'urgent'
  },
  generalMedicine: {
    name: "General Medicine Department",
    floor: "First Floor",
    description: "Primary care for general health concerns and routine check-ups",
    commonSymptoms: [
      "general checkup", "cold symptoms", "flu symptoms", "minor fever",
      "routine physical", "health screening", "minor aches", "general wellness",
      "prescription refill", "health questions"
    ],
    urgencyLevel: 'routine'
  },
  radiology: {
    name: "Radiology Department",
    floor: "Basement Level",
    description: "Medical imaging services including X-rays, CT scans, and MRIs",
    commonSymptoms: [
      "need imaging", "x-ray needed", "ct scan", "mri scan", "ultrasound",
      "medical imaging", "scan appointment"
    ],
    urgencyLevel: 'routine'
  },
  laboratory: {
    name: "Laboratory Services",
    floor: "Basement Level",
    description: "Blood tests, lab work, and diagnostic testing",
    commonSymptoms: [
      "blood test", "lab work", "urine test", "diagnostic testing",
      "blood work needed", "lab results"
    ],
    urgencyLevel: 'routine'
  },
  pharmacy: {
    name: "Pharmacy",
    floor: "Ground Floor",
    description: "Medication dispensing and pharmaceutical consultation",
    commonSymptoms: [
      "medication questions", "prescription pickup", "drug interactions",
      "medication side effects", "pharmacy consultation"
    ],
    urgencyLevel: 'routine'
  }
};