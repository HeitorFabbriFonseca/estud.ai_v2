import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/use-chat";
import { useUser } from "@/providers/user-provider";
import ChatMessage from "./chat-message";
import ChatInput from "./chat-input";

export default function ChatInterface() {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    clearChat,
    currentStudyPlan,
    addToGoogleCalendar,
    isAddingToCalendar
  } = useChat();

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-screen md:h-screen overflow-hidden">
      {/* Chat Header */}
      <div className="bg-white border-b border-neutral-200 shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-3">
              <h2 className="text-sm font-medium text-neutral-800">EduPlan AI Assistant</h2>
              <p className="text-xs text-neutral-500">Create personalized study plans</p>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <button 
            type="button" 
            className="flex items-center text-xs text-neutral-600 hover:text-primary bg-white border border-neutral-200 rounded-md px-2 py-1"
            onClick={clearChat}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear chat
          </button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 no-scrollbar pb-20 md:pb-32"
      >
        {messages.length === 0 ? (
          <ChatMessage
            role="assistant"
            content={`Hello${user ? ', ' + user.name : ''}! I'm your EduPlan AI assistant. I can help you create personalized study plans and add them to your Google Calendar. What would you like to study and what are your goals?`}
          />
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              studyPlan={message.studyPlan}
              onAddToCalendar={addToGoogleCalendar}
              isAddingToCalendar={isAddingToCalendar}
            />
          ))
        )}
        
        {isLoading && (
          <div className="flex items-center space-x-2 p-4 bg-neutral-100 rounded-md animate-pulse">
            <div className="w-3 h-3 bg-neutral-300 rounded-full"></div>
            <div className="w-3 h-3 bg-neutral-400 rounded-full"></div>
            <div className="w-3 h-3 bg-neutral-500 rounded-full"></div>
          </div>
        )}
      </div>

      {/* Chat Input Area */}
      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
    </div>
  );
}
