import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import { useUser } from "@/providers/user-provider";
import { type StudyPlan } from "@shared/schema";

export default function HistoryPage() {
  const { user } = useUser();
  
  const { data: studyPlans, isLoading } = useQuery<StudyPlan[]>({
    queryKey: ['/api/study-plans/history'],
    enabled: !!user,
  });

  return (
    <div className="h-screen flex flex-col md:flex-row">
      <Sidebar />
      <MobileNav />
      <div className="md:ml-64 p-6 pb-16 md:pb-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-800">Study History</h1>
          <p className="text-neutral-600">Review your past study plans and achievements</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden mb-6">
          <div className="p-4 border-b border-neutral-200">
            <h2 className="font-medium text-lg text-neutral-800">Study Plan History</h2>
          </div>
          <div className="p-1">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Topic</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Duration</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Created</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {isLoading ? (
                    Array(4).fill(0).map((_, i) => (
                      <tr key={i}>
                        <td colSpan={5} className="px-6 py-4">
                          <div className="h-6 bg-neutral-200 rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : (
                    studyPlans?.map((plan) => (
                      <tr key={plan.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-800">{plan.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">{plan.duration}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                          {new Date(plan.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={plan.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                          <button className="text-primary hover:text-blue-700">View</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
          <div className="p-4 border-b border-neutral-200">
            <h2 className="font-medium text-lg text-neutral-800">Study Statistics</h2>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p className="text-sm text-blue-700 mb-1">Total Plans</p>
              <p className="text-2xl font-semibold text-blue-900">{studyPlans?.length || 0}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <p className="text-sm text-green-700 mb-1">Completed</p>
              <p className="text-2xl font-semibold text-green-900">
                {studyPlans?.filter(plan => plan.status === 'completed').length || 0}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <p className="text-sm text-purple-700 mb-1">Total Hours</p>
              <p className="text-2xl font-semibold text-purple-900">
                {calculateTotalHours(studyPlans)}
              </p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
              <p className="text-sm text-amber-700 mb-1">Avg. Session</p>
              <p className="text-2xl font-semibold text-amber-900">
                {calculateAvgSession(studyPlans)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let bgColor = 'bg-neutral-100 text-neutral-800';
  
  if (status === 'in_progress') {
    bgColor = 'bg-green-100 text-green-800';
  } else if (status === 'completed') {
    bgColor = 'bg-green-100 text-green-800';
  } else if (status === 'almost_complete') {
    bgColor = 'bg-blue-100 text-blue-800';
  }
  
  const displayText = {
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'abandoned': 'Abandoned',
    'almost_complete': 'Almost Complete'
  }[status] || status;
  
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor}`}>
      {displayText}
    </span>
  );
}

function calculateTotalHours(plans?: StudyPlan[]): number {
  if (!plans || plans.length === 0) return 0;
  return plans.reduce((acc, plan) => {
    // Calculate weeks between start and end date
    const startDate = new Date(plan.startDate);
    const endDate = new Date(plan.endDate);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    
    return acc + (plan.hoursPerWeek * diffWeeks);
  }, 0);
}

function calculateAvgSession(plans?: StudyPlan[]): string {
  if (!plans || plans.length === 0) return "0h";
  
  // Assuming average session is total hours divided by number of sessions per week (estimated at 4)
  const totalHours = calculateTotalHours(plans);
  const totalPlans = plans.length;
  const avgSessionHours = (totalHours / (totalPlans * 4)).toFixed(1);
  
  return `${avgSessionHours}h`;
}
