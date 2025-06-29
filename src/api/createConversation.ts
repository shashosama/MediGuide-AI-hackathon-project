import { IConversation } from "@/types";
import { settingsAtom } from "@/store/settings";
import { getDefaultStore } from "jotai";

// Updated Persona + Replica IDs for Medical Information Directory
// Your custom medical persona and replica from Tavus Platform
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
    contextString = `You are talking with ${settings.name}. `;
  }
  
  // Medical-specific context
  contextString += `Your purpose is to kindly and patiently ask users about their symptoms to help guide them to the most appropriate hospital department. Be reassuring and clear in your communication. You are a helpful medical information assistant that:

1. Listens carefully to symptoms described by patients
2. Asks clarifying questions to better understand their condition
3. Provides guidance on which hospital department would be most appropriate
4. Maintains a calm, empathetic, and professional demeanor
5. Never provides medical diagnoses, only departmental guidance
6. Encourages users to seek proper medical attention when needed

Always be supportive and understanding, as people may be anxious about their health concerns.`;

  // Add any additional custom context from settings
  if (settings.context) {
    contextString += ` Additional context: ${settings.context}`;
  }

  const payload = {
    persona_id: settings.persona || personaId, // Use custom persona if set in settings
    replica_id: settings.replica || replicaId, // Use custom replica if set in settings
    custom_greeting: settings.greeting || "Hello! I'm here to help guide you to the right medical department based on your symptoms. Please tell me what you're experiencing, and I'll do my best to point you in the right direction. How are you feeling today?",
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