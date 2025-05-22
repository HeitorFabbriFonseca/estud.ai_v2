import { 
  users, 
  userPreferences, 
  studyPlans, 
  chatMessages, 
  type User, 
  type InsertUser, 
  type UserPreference, 
  type InsertUserPreference, 
  type StudyPlan, 
  type InsertStudyPlan, 
  type ChatMessage, 
  type InsertChatMessage 
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  
  // User preferences methods
  getUserPreferences(userId: number): Promise<UserPreference | undefined>;
  createUserPreferences(preferences: InsertUserPreference): Promise<UserPreference>;
  updateUserPreferences(userId: number, preferencesData: Partial<UserPreference>): Promise<UserPreference>;
  
  // Study plan methods
  getStudyPlan(id: number): Promise<StudyPlan | undefined>;
  getStudyPlans(userId: number): Promise<StudyPlan[]>;
  createStudyPlan(plan: InsertStudyPlan): Promise<StudyPlan>;
  updateStudyPlan(id: number, planData: Partial<StudyPlan>): Promise<StudyPlan>;
  deleteStudyPlan(id: number): Promise<boolean>;
  
  // Chat message methods
  getChatMessage(id: number): Promise<ChatMessage | undefined>;
  getChatMessages(userId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  clearChatMessages(userId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private userPreferencesData: Map<number, UserPreference>;
  private studyPlansData: Map<number, StudyPlan>;
  private chatMessagesData: Map<number, ChatMessage>;
  private userIdCounter: number;
  private preferencesIdCounter: number;
  private planIdCounter: number;
  private messageIdCounter: number;

  constructor() {
    this.usersData = new Map();
    this.userPreferencesData = new Map();
    this.studyPlansData = new Map();
    this.chatMessagesData = new Map();
    this.userIdCounter = 1;
    this.preferencesIdCounter = 1;
    this.planIdCounter = 1;
    this.messageIdCounter = 1;
    
    // Initialize with a default user for demo purposes
    this.initializeDefaultData();
  }
  
  private initializeDefaultData() {
    // Add default user
    const defaultUser: User = {
      id: 1,
      username: "carlos",
      password: "password123",
      name: "Carlos Silva",
      email: "carlos@example.com",
      profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      phoneNumber: null
    };
    this.usersData.set(defaultUser.id, defaultUser);
    
    // Add default user preferences
    const defaultPreferences: UserPreference = {
      id: 1,
      userId: 1,
      studyTimePreferences: ["evening", "weekend"],
      hoursPerWeek: "10-15 hours",
      learningStyle: "practical",
      defaultCalendar: "Primary Calendar",
      setReminders: true,
      calendarConnected: false,
      calendarEmail: null
    };
    this.userPreferencesData.set(defaultPreferences.id, defaultPreferences);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.usersData.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...user, ...userData };
    this.usersData.set(id, updatedUser);
    return updatedUser;
  }
  
  // User preferences methods
  async getUserPreferences(userId: number): Promise<UserPreference | undefined> {
    return Array.from(this.userPreferencesData.values()).find(
      (prefs) => prefs.userId === userId,
    );
  }
  
  async createUserPreferences(preferences: InsertUserPreference): Promise<UserPreference> {
    const id = this.preferencesIdCounter++;
    const userPreference: UserPreference = { ...preferences, id };
    this.userPreferencesData.set(id, userPreference);
    return userPreference;
  }
  
  async updateUserPreferences(userId: number, preferencesData: Partial<UserPreference>): Promise<UserPreference> {
    let userPrefs = await this.getUserPreferences(userId);
    
    if (!userPrefs) {
      // Create preferences if they don't exist
      userPrefs = await this.createUserPreferences({
        userId,
        studyTimePreferences: preferencesData.studyTimePreferences || [],
        hoursPerWeek: preferencesData.hoursPerWeek || "5-10 hours",
        learningStyle: preferencesData.learningStyle || "visual",
        defaultCalendar: preferencesData.defaultCalendar,
        setReminders: preferencesData.setReminders !== undefined ? preferencesData.setReminders : true,
        calendarConnected: preferencesData.calendarConnected || false,
        calendarEmail: preferencesData.calendarEmail || null
      });
    } else {
      // Update existing preferences
      const updatedPrefs = { ...userPrefs, ...preferencesData };
      this.userPreferencesData.set(userPrefs.id, updatedPrefs);
      userPrefs = updatedPrefs;
    }
    
    return userPrefs;
  }
  
  // Study plan methods
  async getStudyPlan(id: number): Promise<StudyPlan | undefined> {
    return this.studyPlansData.get(id);
  }
  
  async getStudyPlans(userId: number): Promise<StudyPlan[]> {
    return Array.from(this.studyPlansData.values())
      .filter((plan) => plan.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async createStudyPlan(plan: InsertStudyPlan): Promise<StudyPlan> {
    const id = this.planIdCounter++;
    const createdAt = new Date();
    const studyPlan: StudyPlan = { ...plan, id, createdAt };
    this.studyPlansData.set(id, studyPlan);
    return studyPlan;
  }
  
  async updateStudyPlan(id: number, planData: Partial<StudyPlan>): Promise<StudyPlan> {
    const plan = await this.getStudyPlan(id);
    if (!plan) {
      throw new Error("Study plan not found");
    }
    
    const updatedPlan = { ...plan, ...planData };
    this.studyPlansData.set(id, updatedPlan);
    return updatedPlan;
  }
  
  async deleteStudyPlan(id: number): Promise<boolean> {
    return this.studyPlansData.delete(id);
  }
  
  // Chat message methods
  async getChatMessage(id: number): Promise<ChatMessage | undefined> {
    return this.chatMessagesData.get(id);
  }
  
  async getChatMessages(userId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessagesData.values())
      .filter((message) => message.userId === userId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
  
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = this.messageIdCounter++;
    const timestamp = new Date();
    const chatMessage: ChatMessage = { ...message, id, timestamp };
    this.chatMessagesData.set(id, chatMessage);
    return chatMessage;
  }
  
  async clearChatMessages(userId: number): Promise<boolean> {
    const messages = await this.getChatMessages(userId);
    for (const message of messages) {
      this.chatMessagesData.delete(message.id);
    }
    return true;
  }
}

export const storage = new MemStorage();
