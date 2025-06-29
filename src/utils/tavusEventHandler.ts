import { medicalDiagnosis } from './medicalDiagnosis';
import { ToolCallEvent, UtteranceEvent, DiagnosisResult } from '@/types/medical';

export class TavusEventHandler {
  private static instance: TavusEventHandler;

  static getInstance(): TavusEventHandler {
    if (!TavusEventHandler.instance) {
      TavusEventHandler.instance = new TavusEventHandler();
    }
    return TavusEventHandler.instance;
  }

  // Handle utterance events from Tavus CVI
  handleUtteranceEvent(event: UtteranceEvent): void {
    console.log('Utterance received:', event.transcript);
    
    // Store the utterance for potential tool calls
    this.storeUtterance(event.transcript);
  }

  // Handle tool call events from Tavus CVI
  handleToolCallEvent(event: ToolCallEvent): any {
    console.log('Tool call received:', event.tool_name, event.parameters);

    switch (event.tool_name) {
      case 'diagnoseSymptom':
        return this.handleDiagnoseSymptom(event.parameters);
      case 'getDepartmentInfo':
        return this.handleGetDepartmentInfo(event.parameters);
      case 'getWaitingRoomInfo':
        return this.handleGetWaitingRoomInfo(event.parameters);
      case 'provideDirections':
        return this.handleProvideDirections(event.parameters);
      default:
        console.warn('Unknown tool call:', event.tool_name);
        return { error: 'Unknown tool call' };
    }
  }

  private handleDiagnoseSymptom(parameters: any): DiagnosisResult {
    const symptom = parameters.symptom || parameters.symptoms || '';
    
    if (!symptom) {
      throw new Error('No symptom provided for diagnosis');
    }

    const diagnosis = medicalDiagnosis.diagnoseSymptom(symptom);
    
    // Log the diagnosis for monitoring
    console.log('Diagnosis result:', diagnosis);
    
    return diagnosis;
  }

  private handleGetDepartmentInfo(parameters: any): any {
    const departmentName = parameters.department || '';
    
    // Find department by name (case insensitive)
    const department = Object.values(departmentDatabase).find(
      dept => dept.name.toLowerCase().includes(departmentName.toLowerCase())
    );

    if (!department) {
      return { error: 'Department not found' };
    }

    return {
      name: department.name,
      floor: department.floor,
      description: department.description,
      urgencyLevel: department.urgencyLevel
    };
  }

  private handleGetWaitingRoomInfo(parameters: any): any {
    const department = parameters.department || '';
    
    // Mock waiting room data - in real implementation, this would query actual systems
    const waitingTimes = {
      'Emergency Department': { currentWait: '5-10 minutes', patientsWaiting: 3 },
      'Cardiology Department': { currentWait: '15-20 minutes', patientsWaiting: 8 },
      'Orthopedics Department': { currentWait: '25-30 minutes', patientsWaiting: 12 },
      'Neurology Department': { currentWait: '20-25 minutes', patientsWaiting: 6 },
      'Pediatrics Department': { currentWait: '10-15 minutes', patientsWaiting: 4 },
      'Oncology Department': { currentWait: '30-35 minutes', patientsWaiting: 10 },
      'General Medicine Department': { currentWait: '15-20 minutes', patientsWaiting: 7 },
      'Radiology Department': { currentWait: '45-60 minutes', patientsWaiting: 15 },
      'Laboratory Services': { currentWait: '5-10 minutes', patientsWaiting: 2 },
      'Pharmacy': { currentWait: '5-10 minutes', patientsWaiting: 3 }
    };

    return waitingTimes[department] || { currentWait: 'Unknown', patientsWaiting: 0 };
  }

  private handleProvideDirections(parameters: any): any {
    const department = parameters.department || '';
    const fromLocation = parameters.from || 'main entrance';
    
    // Mock directions - in real implementation, this would use hospital mapping
    const directions = {
      'Emergency Department': 'From main entrance: Go straight ahead, Emergency is directly in front of you.',
      'Cardiology Department': 'From main entrance: Take elevator to 3rd floor, turn right, follow signs.',
      'Orthopedics Department': 'From main entrance: Take elevator to 2nd floor, turn left down the main corridor.',
      'Neurology Department': 'From main entrance: Take elevator to 4th floor, follow the blue line on the floor.',
      'Pediatrics Department': 'From main entrance: Take elevator to 5th floor, colorful signs will guide you.',
      'Oncology Department': 'From main entrance: Take elevator to 6th floor, turn right at the nurses station.',
      'General Medicine Department': 'From main entrance: Take elevator to 1st floor or use the stairs, turn left.',
      'Radiology Department': 'From main entrance: Take elevator to basement level, follow yellow signs.',
      'Laboratory Services': 'From main entrance: Take elevator to basement level, turn right.',
      'Pharmacy': 'From main entrance: Turn right, pharmacy is next to the gift shop.'
    };

    return {
      directions: directions[department] || 'Directions not available',
      estimatedWalkTime: '2-5 minutes'
    };
  }

  private storeUtterance(transcript: string): void {
    // Store recent utterances for context in tool calls
    const utterances = JSON.parse(localStorage.getItem('recent_utterances') || '[]');
    utterances.push({
      transcript,
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 10 utterances
    if (utterances.length > 10) {
      utterances.shift();
    }
    
    localStorage.setItem('recent_utterances', JSON.stringify(utterances));
  }

  // Generate response text for Tavus CVI
  generateResponseText(diagnosis: DiagnosisResult): string {
    let response = `I understand. Based on what you've described, it would be best for you to visit our ${diagnosis.department}. `;
    
    response += `They are located on the ${diagnosis.floor}. `;
    
    if (diagnosis.urgencyLevel === 'emergency') {
      response += `This appears to be an urgent situation. Please proceed immediately to the Emergency Department. `;
    } else if (diagnosis.urgencyLevel === 'urgent') {
      response += `I recommend scheduling an appointment as soon as possible. `;
    } else {
      response += `You can schedule a routine appointment during regular hours. `;
    }
    
    if (diagnosis.additionalInfo) {
      response += diagnosis.additionalInfo + ' ';
    }
    
    response += `Would you like me to provide you with directions or information about current waiting times?`;
    
    return response;
  }
}

export const tavusEventHandler = TavusEventHandler.getInstance();

// Import department database
import { departmentDatabase } from './departmentDatabase';