import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import ChatInterface from "@/components/chat/chat-interface";

export default function ChatPage() {
  return (
    <div className="h-screen flex flex-col md:flex-row">
      <Sidebar />
      <MobileNav />
      <div className="md:ml-64 flex-1">
        <ChatInterface />
      </div>
    </div>
  );
}
