import { useUser } from "@/providers/user-provider";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { StudyPlan } from "@shared/schema";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  studyPlan?: StudyPlan;
  onAddToCalendar?: (planId: number) => Promise<void>;
  isAddingToCalendar?: boolean;
}

export default function ChatMessage({ 
  role, 
  content, 
  studyPlan,
  onAddToCalendar,
  isAddingToCalendar = false 
}: ChatMessageProps) {
  const { user } = useUser();

  if (role === "user") {
    return (
      <div className="flex items-start mb-4 justify-end">
        <div className="bg-primary chat-bubble-user shadow-sm p-3 rounded-lg text-white max-w-3xl">
          <p className="text-sm">{content}</p>
        </div>
        <div className="flex-shrink-0 ml-3">
          <img 
            className="h-8 w-8 rounded-full" 
            src={user?.profilePicture || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
            alt="User avatar"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start mb-4">
      <div className="flex-shrink-0 mr-3">
        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </div>
      <div className="bg-white chat-bubble-agent shadow-sm p-3 rounded-lg max-w-3xl">
        {studyPlan ? (
          <>
            <p className="text-sm text-neutral-800 mb-3">
              {content}
            </p>
            
            <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-100">
              <h3 className="font-medium text-blue-800 text-sm mb-2">{studyPlan.title} ({studyPlan.duration})</h3>
              
              {Array.isArray(studyPlan.content) && studyPlan.content.map((section, index) => (
                <div key={index} className="mb-3">
                  <h4 className="text-sm font-medium text-blue-700">{section.title}</h4>
                  <ul className="list-disc pl-5 text-xs text-blue-800 space-y-1">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            
            <div className="flex items-center space-x-3 mb-3">
              <Button
                size="sm"
                className="shadow-sm"
                onClick={() => studyPlan.id && onAddToCalendar?.(studyPlan.id)}
                disabled={isAddingToCalendar || studyPlan.addedToCalendar}
              >
                {isAddingToCalendar ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Adding...
                  </>
                ) : studyPlan.addedToCalendar ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Added to Calendar
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Add to Google Calendar
                  </>
                )}
              </Button>
              
              <Button variant="outline" size="sm" className="shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share Plan
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm text-neutral-800 whitespace-pre-line">{content}</p>
        )}
      </div>
    </div>
  );
}
