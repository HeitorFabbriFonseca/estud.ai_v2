import { Link } from "wouter";
import { StudyPlan } from "@shared/schema";
import { formatDate } from "@/lib/utils";

interface PlanCardProps {
  plan: StudyPlan;
}

export default function PlanCard({ plan }: PlanCardProps) {
  const bgColorClass = plan.colorScheme === 'purple' ? 'bg-purple-500' : 'bg-primary';
  const textColorClass = plan.colorScheme === 'purple' ? 'text-purple-100' : 'text-blue-100';
  
  const getDuration = () => {
    const start = new Date(plan.startDate);
    const end = new Date(plan.endDate);
    
    return `${formatDate(start)} - ${formatDate(end)}`;
  };
  
  const getStatusBadgeStyle = () => {
    if (plan.status === 'in_progress') {
      return 'bg-blue-50 text-blue-700';
    } else if (plan.status === 'completed') {
      return 'bg-green-50 text-green-700';
    } else if (plan.status === 'abandoned') {
      return 'bg-neutral-50 text-neutral-700';
    } else {
      return 'bg-purple-50 text-purple-700';
    }
  };
  
  const getStatusText = () => {
    if (plan.status === 'in_progress') {
      return 'Current focus: ' + plan.currentFocus;
    } else if (plan.status === 'completed') {
      return 'Completed';
    } else if (plan.status === 'abandoned') {
      return 'Abandoned';
    } else {
      return `Completed: ${plan.currentFocus}`;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      <div className={`${bgColorClass} p-3 text-white`}>
        <h3 className="font-medium">{plan.title}</h3>
        <p className={`text-sm ${textColorClass}`}>{plan.duration} • {plan.hoursPerWeek}hrs/week</p>
      </div>
      <div className="p-4">
        <div className="flex items-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm text-neutral-600">{getDuration()}</span>
        </div>
        <div className="flex items-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-neutral-600">{plan.schedule}</span>
        </div>
        <div className={`rounded p-2 mb-3 ${getStatusBadgeStyle()}`}>
          <div className="flex items-center">
            {plan.status === 'in_progress' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            ) : plan.status === 'completed' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="text-xs font-medium">{getStatusText()}</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/study-plans/${plan.id}/edit`} className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-1.5 rounded text-sm font-medium text-center">
            Edit
          </Link>
          <Link href={`/study-plans/${plan.id}`} className="flex-1 bg-primary hover:bg-blue-600 text-white py-1.5 rounded text-sm font-medium text-center">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
