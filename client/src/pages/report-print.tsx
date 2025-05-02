import React from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ReportPrint } from "@/components/reports/report-print";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportPrintPage() {
  const { reportId } = useParams();
  const { data: report, isLoading } = useQuery<any>({
    queryKey: [`/api/reports/download/${reportId}`],
    enabled: !!reportId,
  });

  if (isLoading) {
    return <div className="max-w-2xl mx-auto py-16"><Skeleton className="h-96 w-full" /></div>;
  }
  if (!report) {
    return <div className="max-w-2xl mx-auto py-16 text-center text-lg">Report not found</div>;
  }

  // Parse results and patient info from report
  let results = report.results;
  if (typeof results === "string") {
    try {
      results = JSON.parse(results);
    } catch {
      results = {};
    }
  }
  const patient = {
    name: report.user?.fullName || "N/A",
    age: report.user?.age || "N/A",
    sex: report.user?.sex || "N/A",
    refBy: report.booking?.referredBy || "N/A",
    labRefNo: report.reportId || "N/A",
    sNo: report.booking?.bookingId || "N/A",
    date: report.generatedDate ? new Date(report.generatedDate).toLocaleDateString() : "N/A",
  };
  const testType = report.test?.panel || report.test?.name || "CBC";
  const comments = report.insights || report.comments || "";

  return <ReportPrint patient={patient} results={results} testType={testType} comments={comments} />;
} 