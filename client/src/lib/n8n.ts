import axios from "axios";

// Set default base URL from environment
const N8N_API_URL = process.env.N8N_API_URL || "https://n8n-api.example.com";
const N8N_API_KEY = process.env.N8N_API_KEY || "";

// Create axios instance with base configuration
const n8nClient = axios.create({
  baseURL: N8N_API_URL,
  headers: {
    "Content-Type": "application/json",
    "X-N8N-API-KEY": N8N_API_KEY
  }
});

interface ChatCompletionResponse {
  response: string;
  studyPlan?: any;
}

/**
 * Send a message to the n8n agent chat
 * @param message User's message to the chat
 * @param conversationHistory Previous messages in the conversation
 */
export async function sendChatMessage(
  message: string, 
  conversationHistory: { role: string; content: string }[] = []
): Promise<ChatCompletionResponse> {
  try {
    const response = await n8nClient.post("/webhook/chat-agent", {
      message,
      conversationHistory
    });

    return response.data;
  } catch (error) {
    console.error("Error calling n8n agent:", error);
    throw new Error("Failed to communicate with the study plan assistant");
  }
}

/**
 * Generate a study plan using the n8n agent
 * @param subject Subject to create a study plan for
 * @param duration Duration of the study plan
 * @param hours Hours per week available for studying
 * @param preferences User's learning preferences
 */
export async function generateStudyPlan(
  subject: string,
  duration: string,
  hours: number,
  preferences: {
    learningStyle: string;
    goals: string;
    experience: string;
  }
): Promise<any> {
  try {
    const response = await n8nClient.post("/webhook/generate-study-plan", {
      subject,
      duration,
      hoursPerWeek: hours,
      preferences
    });

    return response.data;
  } catch (error) {
    console.error("Error generating study plan:", error);
    throw new Error("Failed to generate study plan");
  }
}
