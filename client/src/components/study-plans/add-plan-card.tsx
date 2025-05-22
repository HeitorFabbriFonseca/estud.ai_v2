import { Link } from "wouter";

export default function AddPlanCard() {
  return (
    <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <h3 className="font-medium text-neutral-700 mb-1">Create New Study Plan</h3>
      <p className="text-sm text-neutral-500 mb-3">Start a conversation with the AI assistant</p>
      <Link href="/" className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium">
        Start New Plan
      </Link>
    </div>
  );
}
