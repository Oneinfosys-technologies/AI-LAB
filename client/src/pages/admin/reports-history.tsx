import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function ReportsHistoryPage() {
  const { data: reports, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/reports"],
  });

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Reports History</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : reports && reports.length > 0 ? (
            <table className="min-w-full">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Test</th>
                  <th>Patient</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td>{report.reportId}</td>
                    <td>{report.test?.name || "-"}</td>
                    <td>{report.user?.fullName || "-"}</td>
                    <td>{report.booking?.status || "-"}</td>
                    <td>{report.generatedDate ? format(new Date(report.generatedDate), "yyyy-MM-dd") : "-"}</td>
                    <td>
                      <Button size="sm" variant="outline">Edit</Button>
                      <Button size="sm" variant="ghost" className="ml-2">Timeline</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div>No reports found.</div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
} 