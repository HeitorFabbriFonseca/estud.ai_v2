import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { insertChatMessageSchema, insertStudyPlanSchema } from "@shared/schema";
import { z } from "zod";

// n8n API configuration
const N8N_API_URL = process.env.N8N_API_URL || "https://n8n-api.example.com";
const N8N_API_KEY = process.env.N8N_API_KEY || "";

// Google Calendar API configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/google/callback";
const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_SCOPES = ["https://www.googleapis.com/auth/calendar"];

export async function registerRoutes(app: Express): Promise<Server> {
  // ----- User Routes -----
  
  // Get current user
  app.get("/api/user/current", async (req: Request, res: Response) => {
    try {
      // For demo purposes, use a default user
      const userId = 1;
      const user = await storage.getUser(userId);
      const preferences = await storage.getUserPreferences(userId);
      
      res.json({ user, preferences });
    } catch (error) {
      res.status(500).json({ message: "Error fetching user data" });
    }
  });
  
  // Update user profile
  app.put("/api/user/profile", async (req: Request, res: Response) => {
    try {
      // For demo purposes, use a default user
      const userId = 1;
      
      const { name, email, phoneNumber, ...preferencesData } = req.body;
      
      // Update user info
      await storage.updateUser(userId, { name, email, phoneNumber });
      
      // Update user preferences
      await storage.updateUserPreferences(userId, preferencesData);
      
      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating profile" });
    }
  });
  
  // ----- Chat Routes -----
  
  // Get chat history
  app.get("/api/chat/history", async (req: Request, res: Response) => {
    try {
      // For demo purposes, use a default user
      const userId = 1;
      const messages = await storage.getChatMessages(userId);
      
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching chat history" });
    }
  });
  
  // Send chat message
  app.post("/api/chat/message", async (req: Request, res: Response) => {
    try {
      // For demo purposes, use a default user
      const userId = 1;
      
      // Validate request body
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ message: "Message content is required" });
      }
      
      // Save user message
      const userMessageData = {
        userId,
        role: "user",
        content
      };
      
      await storage.createChatMessage(userMessageData);
      
      // Get conversation history
      const conversationHistory = await storage.getChatMessages(userId);
      
      // Send message to n8n agent
      const n8nResponse = await axios.post(`${N8N_API_URL}/webhook/chat-agent`, {
        message: content,
        conversationHistory: conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      }, {
        headers: {
          "Content-Type": "application/json",
          "X-N8N-API-KEY": N8N_API_KEY
        }
      });
      
      const assistantMessage = n8nResponse.data.response;
      let studyPlan = null;
      
      // Check if response contains a study plan
      if (n8nResponse.data.studyPlan) {
        // Create a new study plan
        const planData = {
          userId,
          title: n8nResponse.data.studyPlan.title,
          description: n8nResponse.data.studyPlan.description || "",
          duration: n8nResponse.data.studyPlan.duration,
          hoursPerWeek: n8nResponse.data.studyPlan.hoursPerWeek,
          startDate: new Date(n8nResponse.data.studyPlan.startDate),
          endDate: new Date(n8nResponse.data.studyPlan.endDate),
          schedule: n8nResponse.data.studyPlan.schedule,
          currentFocus: n8nResponse.data.studyPlan.currentFocus || "",
          status: "in_progress",
          colorScheme: "blue",
          content: n8nResponse.data.studyPlan.content
        };
        
        studyPlan = await storage.createStudyPlan(planData);
      }
      
      // Save assistant message
      const assistantMessageData = {
        userId,
        role: "assistant",
        content: assistantMessage,
        studyPlanId: studyPlan ? studyPlan.id : undefined
      };
      
      const savedMessage = await storage.createChatMessage(assistantMessageData);
      
      res.json({ 
        message: savedMessage,
        studyPlan
      });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Error sending message" });
    }
  });
  
  // Clear chat history
  app.delete("/api/chat/clear", async (req: Request, res: Response) => {
    try {
      // For demo purposes, use a default user
      const userId = 1;
      await storage.clearChatMessages(userId);
      
      res.json({ message: "Chat history cleared" });
    } catch (error) {
      res.status(500).json({ message: "Error clearing chat history" });
    }
  });
  
  // ----- Study Plan Routes -----
  
  // Get all study plans
  app.get("/api/study-plans", async (req: Request, res: Response) => {
    try {
      // For demo purposes, use a default user
      const userId = 1;
      const plans = await storage.getStudyPlans(userId);
      
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Error fetching study plans" });
    }
  });
  
  // Get study plan history
  app.get("/api/study-plans/history", async (req: Request, res: Response) => {
    try {
      // For demo purposes, use a default user
      const userId = 1;
      const plans = await storage.getStudyPlans(userId);
      
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Error fetching study plan history" });
    }
  });
  
  // Get single study plan
  app.get("/api/study-plans/:id", async (req: Request, res: Response) => {
    try {
      const planId = parseInt(req.params.id);
      if (isNaN(planId)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }
      
      const plan = await storage.getStudyPlan(planId);
      if (!plan) {
        return res.status(404).json({ message: "Study plan not found" });
      }
      
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Error fetching study plan" });
    }
  });
  
  // Add study plan to Google Calendar
  app.post("/api/study-plans/:id/calendar", async (req: Request, res: Response) => {
    try {
      // For demo purposes, use a default user
      const userId = 1;
      const planId = parseInt(req.params.id);
      
      if (isNaN(planId)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }
      
      const plan = await storage.getStudyPlan(planId);
      if (!plan) {
        return res.status(404).json({ message: "Study plan not found" });
      }
      
      // Check if user has connected Google Calendar
      const preferences = await storage.getUserPreferences(userId);
      if (!preferences || !preferences.calendarConnected) {
        return res.status(400).json({ message: "Google Calendar not connected" });
      }
      
      // For demo purposes, simulate adding to calendar
      const eventIds = ["event_1", "event_2", "event_3"];
      
      // Update plan with calendar event IDs
      await storage.updateStudyPlan(planId, {
        addedToCalendar: true,
        calendarEventIds: eventIds
      });
      
      res.json({ 
        message: "Study plan added to Google Calendar",
        eventIds
      });
    } catch (error) {
      console.error("Error adding to calendar:", error);
      res.status(500).json({ message: "Error adding study plan to calendar" });
    }
  });
  
  // ----- Google Calendar Routes -----
  
  // Get Google Auth URL
  app.get("/api/google/auth-url", (req: Request, res: Response) => {
    try {
      // Generate random state for security
      const state = Math.random().toString(36).substring(2, 15);
      
      // Create authorization URL
      const authUrl = new URL(GOOGLE_AUTH_ENDPOINT);
      authUrl.searchParams.append("client_id", GOOGLE_CLIENT_ID);
      authUrl.searchParams.append("redirect_uri", GOOGLE_REDIRECT_URI);
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("state", state);
      authUrl.searchParams.append("scope", GOOGLE_SCOPES.join(" "));
      authUrl.searchParams.append("access_type", "offline");
      authUrl.searchParams.append("prompt", "consent");
      
      res.json({ url: authUrl.toString() });
    } catch (error) {
      console.error("Error generating auth URL:", error);
      res.status(500).json({ message: "Error generating authorization URL" });
    }
  });
  
  // Handle Google Auth Callback
  app.get("/api/google/callback", async (req: Request, res: Response) => {
    try {
      const { code } = req.query;
      
      if (!code) {
        return res.status(400).send("Authorization code missing");
      }
      
      // Exchange code for tokens
      const tokenResponse = await axios.post(GOOGLE_TOKEN_ENDPOINT, {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code"
      });
      
      const { access_token, refresh_token } = tokenResponse.data;
      
      // For demo purposes, use a default user
      const userId = 1;
      
      // Get user email from Google
      const userInfoResponse = await axios.get("https://www.googleapis.com/oauth2/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });
      
      const { email } = userInfoResponse.data;
      
      // Update user preferences with calendar connection
      await storage.updateUserPreferences(userId, {
        calendarConnected: true,
        calendarEmail: email
      });
      
      // Respond with success HTML that closes the popup window
      res.send(`
        <html>
          <body>
            <h1>Google Calendar Connected Successfully</h1>
            <p>You can close this window now.</p>
            <script>window.close();</script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Error handling Google callback:", error);
      res.status(500).send("Error connecting Google Calendar");
    }
  });
  
  // Disconnect Google Calendar
  app.post("/api/google/disconnect", async (req: Request, res: Response) => {
    try {
      // For demo purposes, use a default user
      const userId = 1;
      
      // Update user preferences to disconnect calendar
      await storage.updateUserPreferences(userId, {
        calendarConnected: false,
        calendarEmail: null
      });
      
      res.json({ message: "Google Calendar disconnected successfully" });
    } catch (error) {
      console.error("Error disconnecting Google Calendar:", error);
      res.status(500).json({ message: "Error disconnecting Google Calendar" });
    }
  });
  
  // Check Google Calendar connection status
  app.get("/api/google/connection-status", async (req: Request, res: Response) => {
    try {
      // For demo purposes, use a default user
      const userId = 1;
      
      const preferences = await storage.getUserPreferences(userId);
      const connected = preferences ? preferences.calendarConnected : false;
      
      res.json({ connected });
    } catch (error) {
      console.error("Error checking connection status:", error);
      res.status(500).json({ message: "Error checking connection status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
