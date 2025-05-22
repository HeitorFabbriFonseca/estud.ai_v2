import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "./use-toast";

export function useGoogleCalendar() {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const connectGoogleCalendar = async () => {
    setIsConnecting(true);
    try {
      const response = await apiRequest('GET', '/api/google/auth-url');
      const { url } = await response.json();
      
      // Open Google authorization window
      const authWindow = window.open(url, '_blank', 'width=600,height=600');
      
      // Set up a check for when the window closes
      const checkClosed = setInterval(() => {
        if (authWindow?.closed) {
          clearInterval(checkClosed);
          checkConnection();
          setIsConnecting(false);
        }
      }, 500);
      
      return true;
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to Google Calendar. Please try again.",
        variant: "destructive",
      });
      setIsConnecting(false);
      return false;
    }
  };

  const disconnectGoogleCalendar = async () => {
    try {
      await apiRequest('POST', '/api/google/disconnect');
      setIsConnected(false);
      return true;
    } catch (error) {
      console.error('Error disconnecting from Google Calendar:', error);
      toast({
        title: "Disconnection Failed",
        description: "Could not disconnect from Google Calendar. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const checkConnection = async () => {
    try {
      const response = await apiRequest('GET', '/api/google/connection-status');
      const { connected } = await response.json();
      setIsConnected(connected);
      return connected;
    } catch (error) {
      console.error('Error checking Google Calendar connection:', error);
      return false;
    }
  };

  return {
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    checkConnection,
    isConnecting,
    isConnected
  };
}
