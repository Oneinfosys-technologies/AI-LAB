import { ActiveTests } from "@/components/dashboard/active-tests";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function ReportingPage() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Reporting / Manual Results Entry</h1>
      <ActiveTests />
    </DashboardLayout>
  );
} 