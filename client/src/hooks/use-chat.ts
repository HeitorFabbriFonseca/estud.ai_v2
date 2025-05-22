import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/providers/user-provider";
import { ChatMessage, StudyPlan } from "@shared/schema";

interface Message {
  role: "user" | "assistant";
  content: string;
  studyPlan?: StudyPlan;
}

export function useChat() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStudyPlan, setCurrentStudyPlan] = useState<StudyPlan | null>(null);
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);

  // Fetch chat history
  const { data: chatHistory, isLoading: isLoadingHistory } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/history'],
    enabled: !!user,
  });

  // Send message mutation
  const { mutate: sendMessageMutation, isPending } = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest('POST', '/api/chat/message', { content });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      
      // Add assistant message to the chat
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: data.message.content,
          studyPlan: data.studyPlan
        }
      ]);
      
      // Update current study plan if received
      if (data.studyPlan) {
        setCurrentStudyPlan(data.studyPlan);
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/chat/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/study-plans'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Load chat history when available
  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      const formattedMessages = chatHistory.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));
      setMessages(formattedMessages);
    }
  }, [chatHistory]);

  // Add to Google Calendar mutation
  const { mutate: addToCalendarMutation } = useMutation({
    mutationFn: async (planId: number) => {
      setIsAddingToCalendar(true);
      return apiRequest('POST', `/api/study-plans/${planId}/calendar`);
    },
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Study plan added to your Google Calendar.",
      });
      
      // Update local state to reflect calendar integration
      if (currentStudyPlan) {
        setCurrentStudyPlan({
          ...currentStudyPlan,
          addedToCalendar: true,
        });
        
        // Update the message that contains the study plan
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.studyPlan?.id === currentStudyPlan.id 
              ? { 
                  ...msg, 
                  studyPlan: { 
                    ...msg.studyPlan!, 
                    addedToCalendar: true 
                  } 
                }
              : msg
          )
        );
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/study-plans'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add plan to Google Calendar. Please check your calendar connection.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsAddingToCalendar(false);
    }
  });

  const sendMessage = async (content: string) => {
    // Add user message to chat
    setMessages(prev => [...prev, { role: "user", content }]);
    
    // Send message to backend
    sendMessageMutation(content);
  };

  const clearChat = async () => {
    try {
      await apiRequest('DELETE', '/api/chat/clear');
      setMessages([]);
      setCurrentStudyPlan(null);
      toast({
        title: "Chat cleared",
        description: "Your chat history has been cleared.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear chat history.",
        variant: "destructive",
      });
    }
  };

  const addToGoogleCalendar = async (planId: number) => {
    addToCalendarMutation(planId);
  };

  return {
    messages,
    sendMessage,
    isLoading: isPending,
    clearChat,
    currentStudyPlan,
    addToGoogleCalendar,
    isAddingToCalendar
  };
}
