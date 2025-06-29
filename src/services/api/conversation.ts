import { IConversation } from "@/types";
import { settingsAtom } from "@/store/settings";
import { getDefaultStore } from "jotai";

// Updated Persona + Replica IDs for Medical Information Directory
const personaId = "p6de07a7b017"; // Your medical persona ID
const replicaId = "rb17cf590e15";  // Your medical replica ID

export const createConversation = async (
  token: string,
): Promise<IConversation> => {
  if (!token) {
    throw new Error("API token is required");
  }

  const settings = getDefaultStore().get(settingsAtom);

  // Enhanced medical context and greeting
  let contextString = "";
  if (settings.name) {
    contextString = `The patient's name is ${settings.name}. `;
  }
  
  // Medical-specific context
  contextString += `Act as a professional medical information assistant. Your purpose is to:

1. Provide a brief greeting and then PAUSE to let the patient speak
2. Listen carefully to symptoms described by patients
3. Ask clarifying questions to better understand their condition
4. Provide guidance on which hospital department would be most appropriate
5. Maintain a calm, empathetic, and professional demeanor
6. Never provide medical diagnoses, only departmental guidance
7. Encourage patients to seek proper medical attention when needed

IMPORTANT: After your initial greeting, WAIT for the patient to speak. Do not continue talking. Let them describe their symptoms first.

Always be supportive and understanding, as people may be anxious about their health concerns.`;

  // Add any additional custom context from settings
  if (settings.context) {
    contextString += ` Additional context: ${settings.context}`;
  }

  const payload = {
    persona_id: settings.persona || personaId,
    replica_id: settings.replica || replicaId,
    custom_greeting: settings.greeting || "Hello! I'm here to help guide you to the right medical department based on your symptoms. Please tell me what you're experiencing.",
    conversational_context: contextString,
    properties: {
      max_call_duration: 600,
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
      } else {
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
    }

    const data = await response.json();
    console.log("Conversation created successfully:", data);
    
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