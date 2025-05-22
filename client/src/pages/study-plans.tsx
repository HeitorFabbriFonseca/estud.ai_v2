import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import PlanCard from "@/components/study-plans/plan-card";
import AddPlanCard from "@/components/study-plans/add-plan-card";
import { useUser } from "@/providers/user-provider";
import { type StudyPlan } from "@shared/schema";

export default function StudyPlansPage() {
  const { user } = useUser();
  
  const { data: studyPlans, isLoading } = useQuery<StudyPlan[]>({
    queryKey: ['/api/study-plans'],
    enabled: !!user,
  });

  return (
    <div className="h-screen flex flex-col md:flex-row">
      <Sidebar />
      <MobileNav />
      <div className="md:ml-64 p-6 pb-16 md:pb-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-800">Study Plans</h1>
          <p className="text-neutral-600">View and manage your scheduled study plans</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-neutral-200 h-64 animate-pulse" />
            ))
          ) : (
            <>
              {studyPlans?.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
              <AddPlanCard />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
