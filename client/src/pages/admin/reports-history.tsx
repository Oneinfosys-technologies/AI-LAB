import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Eye, Edit, Download, Printer } from "lucide-react";
import { Link } from "wouter";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsHistoryPage() {
  const { data: reports, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/reports"],
  });

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Reports History
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          View and manage all test reports
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : reports && reports.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Report ID</th>
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Test</th>
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Patient</th>
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Status</th>
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Date</th>
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-b border-slate-200 dark:border-slate-700">
                      <td className="py-3 font-mono">{report.reportId}</td>
                      <td className="py-3">{report.test?.name || "-"}</td>
                      <td className="py-3">{report.user?.fullName || "-"}</td>
                      <td className="py-3">
                        <StatusBadge status={report.booking?.status || "completed"} />
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">
                        {report.generatedDate ? format(new Date(report.generatedDate), "MMM d, yyyy") : "-"}
                      </td>
                      <td className="py-3">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/reports/${report.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/reports/edit/${report.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/reports/download/${report.reportId}`}>
                              <Download className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/reports/print/${report.reportId}`}>
                              <Printer className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">No Reports Found</h3>
              <p className="text-slate-500 dark:text-slate-400">
                There are no reports in the system yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
} 