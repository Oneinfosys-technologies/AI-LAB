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

  // Parse CBC and patient info from report
  const cbc = {
    hemoglobin: report.results?.hemoglobin,
    totalLeukocyteCount: report.results?.totalLeukocyteCount,
    neutrophils: report.results?.neutrophils,
    lymphocytes: report.results?.lymphocytes,
    eosinophils: report.results?.eosinophils,
    monocytes: report.results?.monocytes,
    basophils: report.results?.basophils,
    rbcCount: report.results?.rbcCount,
    pcv: report.results?.pcv,
    mcv: report.results?.mcv,
    mch: report.results?.mch,
    mchc: report.results?.mchc,
    rdwCv: report.results?.rdwCv,
    plateletCount: report.results?.plateletCount,
  };
  const patient = {
    name: report.user?.fullName || "N/A",
    age: report.user?.age || "N/A",
    sex: report.user?.sex || "N/A",
    refBy: report.booking?.referredBy || "N/A",
    labRefNo: report.reportId || "N/A",
    sNo: report.booking?.bookingId || "N/A",
    date: report.generatedDate ? new Date(report.generatedDate).toLocaleDateString() : "N/A",
  };

  return <ReportPrint patient={patient} cbc={cbc} />;
} 