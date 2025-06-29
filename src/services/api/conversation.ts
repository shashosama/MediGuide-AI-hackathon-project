import { IConversation } from "@/types";
import { settingsAtom } from "@/store/settings";
import { getDefaultStore } from "jotai";

// Hardcoded persona and replica IDs for medical assistant
const defaultPersonaId = "p3bb4745d4f9"; // Your medical persona ID
const defaultReplicaId = "rb17cf590e15";  // Your medical replica ID

export const createConversation = async (
  token: string,
): Promise<IConversation> => {
  if (!token) {
    throw new Error("API token is required");
  }

  const settings = getDefaultStore().get(settingsAtom);

  // Use hardcoded persona ID as default, but allow settings override
  const personaId = settings.persona || defaultPersonaId;
  const replicaId = settings.replica || defaultReplicaId;

  // Enhanced medical context with professional language
  let contextString = "";
  if (settings.name) {
    contextString = `The patient's name is ${settings.name}. `;
  }
  
  // Medical-specific context with professional language and tool definitions
  contextString += `Act as a professional medical information assistant that helps patients find the appropriate hospital department. The role includes:

1. Listen carefully to symptoms described by patients
2. Use the diagnoseSymptom tool to analyze symptoms and recommend departments
3. Provide clear, empathetic guidance about which department to visit
4. Offer additional information like directions and waiting times when helpful
5. Maintain a calm, professional, and reassuring demeanor
6. Never provide medical diagnoses, only departmental guidance

IMPORTANT LANGUAGE GUIDELINES:
- Use professional medical assistant language
- Avoid using "you" repeatedly - use alternatives like "the patient", "this condition", "these symptoms"
- Use phrases like "I recommend", "It would be best to", "The appropriate department would be"
- Speak in third person when referring to symptoms: "Based on the symptoms described" instead of "Based on what you described"
- Use professional medical terminology appropriately

Available tools:
- diagnoseSymptom(symptom: string): Analyzes symptoms and recommends the appropriate department
- getDepartmentInfo(department: string): Gets detailed information about a specific department
- getWaitingRoomInfo(department: string): Gets current waiting times and patient counts
- provideDirections(department: string, from?: string): Provides directions to a department

When a patient describes symptoms, always use the diagnoseSymptom tool to provide accurate department recommendations.

Example professional responses:
- "Based on the symptoms described, I recommend visiting the Cardiology department."
- "These symptoms suggest the Orthopedics department would be most appropriate."
- "The condition described indicates Emergency care may be needed."
- "For these particular symptoms, the Neurology department specializes in this area."`;

  // Add any additional custom context from settings
  if (settings.context) {
    contextString += ` Additional context: ${settings.context}`;
  }

  const payload = {
    persona_id: personaId,
    replica_id: replicaId,
    custom_greeting: settings.greeting || "Hello! I'm here to help guide patients to the right medical department based on symptoms. Please describe any symptoms being experienced, and I'll provide guidance on the most appropriate department to visit.",
    conversational_context: contextString,
    // Add additional configuration for better reliability
    properties: {
      max_call_duration: 600, // 10 minutes
      participant_left_timeout: 60,
      participant_absent_timeout: 30,
      enable_recording: false,
      enable_transcription: true
    }
  };

  console.log("Sending payload to Tavus API:", payload);

  try {
    const response = await fetch("https://tavusapi.com/v2/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": token,
      },
      body: JSON.stringify(payload),
    });

    console.log("Tavus API response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Tavus API error response:", errorText);
      
      if (response.status === 401) {
        throw new Error("Invalid API token. Please check your Tavus API key.");
      } else if (response.status === 403) {
        throw new Error("API access forbidden. Please verify your Tavus account permissions.");
      } else if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a moment.");
      } else if (response.status === 400 && errorText.includes("Invalid persona_id")) {
        throw new Error("Invalid persona ID. Please check your persona ID in the settings and ensure it's valid in your Tavus dashboard.");
      } else {
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
    }

    const data = await response.json();
    console.log("Conversation created successfully:", data);
    
    // Validate the response structure
    if (!data.conversation_id || !data.conversation_url) {
      throw new Error("Invalid response from Tavus API - missing required fields");
    }

    return data;
  } catch (error) {
    console.error("Error creating conversation:", error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Network error. Please check your internet connection and try again.");
    }
    
    throw error;
  }
};

export const endConversation = async (
  token: string,
  conversationId: string,
) => {
  try {
    const response = await fetch(
      `https://tavusapi.com/v2/conversations/${conversationId}/end`,
      {
        method: "POST",
        headers: {
          "x-api-key": token ?? "",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to end conversation");
    }

    return null;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};