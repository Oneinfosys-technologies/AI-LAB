import { useAuth } from "@/hooks/use-auth";
import PatientChat from "@/components/health-chat/patient-chat";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function HealthChatPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Health AI Assistant</h1>
        
        <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg p-6">
          <PatientChat />
        </div>
      </div>
    </DashboardLayout>
  );
}