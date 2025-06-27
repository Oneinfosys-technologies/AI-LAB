import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, TestTube } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Booking, TEST_STATUSES } from "@shared/schema";
import { Link } from "wouter";
import { format } from "date-fns";
import { getStatusColor } from "@/lib/utils/ai-insights";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface BookingWithDetails extends Booking {
  test?: any;
  statuses?: any[];
}

// Define test panels and their fields, units, normal ranges, and formulas
interface TestPanelField {
  name: string;
  label: string;
  unit: string;
  required: boolean;
  calculated?: boolean;
}
interface TestPanel {
  fields: TestPanelField[];
  calculate: (values: Record<string, any>) => Record<string, any>;
}
const TEST_PANELS: Record<string, TestPanel> = {
  CBC: {
    fields: [
      { name: "hemoglobin", label: "Hemoglobin (g/dL)", unit: "g/dL", required: true },
      { name: "hematocrit", label: "Hematocrit (%)", unit: "%", required: true },
      { name: "rbcCount", label: "RBC (million/µL)", unit: "million/µL", required: true },
      { name: "wbcCount", label: "WBC (thousand/µL)", unit: "thousand/µL", required: true },
      { name: "plateletCount", label: "Platelet (thousand/µL)", unit: "thousand/µL", required: true },
      { name: "neutrophils", label: "Neutrophils (%)", unit: "%", required: true },
      { name: "lymphocytes", label: "Lymphocytes (%)", unit: "%", required: true },
      { name: "eosinophils", label: "Eosinophils (%)", unit: "%", required: true },
      { name: "monocytes", label: "Monocytes (%)", unit: "%", required: true },
      { name: "basophils", label: "Basophils (%)", unit: "%", required: true },
    ],
    calculate: (values: Record<string, any>) => values, // No calculated fields for now
  },
  LFT: {
    fields: [
      { name: "total_bilirubin", label: "Total Bilirubin (mg/dL)", unit: "mg/dL", required: true },
      { name: "direct_bilirubin", label: "Direct Bilirubin (mg/dL)", unit: "mg/dL", required: true },
      { name: "indirect_bilirubin", label: "Indirect Bilirubin (mg/dL)", unit: "mg/dL", required: false, calculated: true },
      { name: "sgot_ast", label: "SGOT/AST (U/L)", unit: "U/L", required: true },
      { name: "sgpt_alt", label: "SGPT/ALT (U/L)", unit: "U/L", required: true },
      { name: "alkaline_phosphatase", label: "Alkaline Phosphatase (U/L)", unit: "U/L", required: true },
      { name: "total_protein", label: "Total Protein (g/dL)", unit: "g/dL", required: true },
      { name: "albumin", label: "Albumin (g/dL)", unit: "g/dL", required: true },
      { name: "globulin", label: "Globulin (g/dL)", unit: "g/dL", required: false, calculated: true },
      { name: "ag_ratio", label: "A/G Ratio", unit: "", required: false, calculated: true },
    ],
    calculate: (values: Record<string, any>) => {
      const indirect_bilirubin = values.total_bilirubin && values.direct_bilirubin ? (parseFloat(values.total_bilirubin) - parseFloat(values.direct_bilirubin)).toFixed(2) : '';
      const globulin = values.total_protein && values.albumin ? (parseFloat(values.total_protein) - parseFloat(values.albumin)).toFixed(2) : '';
      const ag_ratio = values.albumin && globulin && parseFloat(globulin) !== 0 ? (parseFloat(values.albumin) / parseFloat(globulin)).toFixed(2) : '';
      return { ...values, indirect_bilirubin, globulin, ag_ratio };
    },
  },
  LIPID: {
    fields: [
      { name: "total_cholesterol", label: "Total Cholesterol (mg/dl)", unit: "mg/dl", required: true },
      { name: "hdl", label: "HDL Cholesterol (mg/dl)", unit: "mg/dl", required: true },
      { name: "ldl", label: "LDL Cholesterol (mg/dl)", unit: "mg/dl", required: true },
      { name: "triglycerides", label: "Triglycerides (mg/dl)", unit: "mg/dl", required: true },
      { name: "vldl", label: "VLDL Cholesterol (mg/dl)", unit: "mg/dl", required: false },
    ],
    calculate: (values: Record<string, any>) => values,
  },
  HBA1C: {
    fields: [
      { name: "hba1c", label: "HbA1c (%)", unit: "%", required: true },
    ],
    calculate: (values: Record<string, any>) => values,
  },
  THYROID: {
    fields: [
      { name: "tsh", label: "TSH (µIU/mL)", unit: "µIU/mL", required: true },
      { name: "t3", label: "T3 (ng/dL)", unit: "ng/dL", required: true },
      { name: "t4", label: "T4 (µg/dL)", unit: "µg/dL", required: true },
    ],
    calculate: (values: Record<string, any>) => values,
  },
  VITAMIN_D3: {
    fields: [
      { name: "vitamin_d3", label: "Vitamin D3 (ng/mL)", unit: "ng/mL", required: true },
    ],
    calculate: (values: Record<string, any>) => values,
  },
  VITAMIN_B12: {
    fields: [
      { name: "vitamin_b12", label: "Vitamin B12 (pg/mL)", unit: "pg/mL", required: true },
    ],
    calculate: (values: Record<string, any>) => values,
  },
  CRP: {
    fields: [
      { name: "crp", label: "CRP (mg/L)", unit: "mg/L", required: true },
    ],
    calculate: (values: Record<string, any>) => values,
  },
};

export function ActiveTests() {
  const [expandedBookings, setExpandedBookings] = useState<Record<number, boolean>>({});
  const [resultModal, setResultModal] = useState<{ open: boolean; bookingId?: number; testType?: string }>({ open: false });
  const [resultForm, setResultForm] = useState<any>({});
  const { toast } = useToast();
  
  const { data: bookings, isLoading, refetch } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/admin/bookings"],
  });
  
  // Filter active tests (not completed)
  const activeTests = bookings?.filter(booking => booking.status !== TEST_STATUSES.COMPLETED);
  
  // CBC result mutation
  const cbcMutation = useMutation({
    mutationFn: async ({ bookingId, values }: { bookingId: number; values: any }) => {
      const res = await fetch(`/api/admin/bookings/${bookingId}/cbc-result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to save CBC result");
      return json;
    },
    onSuccess: () => {
      toast({ title: "CBC result saved" });
      setResultModal({ open: false });
      setResultForm({});
      refetch();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  // Booking status update mutation
  const statusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: number; status: string }) => {
      const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update status");
      return json;
    },
    onSuccess: () => {
      toast({ title: "Status updated" });
      refetch();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  const toggleExpanded = (bookingId: number) => {
    setExpandedBookings(prev => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };
  
  const getStatusSteps = (booking: BookingWithDetails) => {
    const allStatuses = [
      TEST_STATUSES.BOOKED,
      TEST_STATUSES.SAMPLE_COLLECTED,
      TEST_STATUSES.PROCESSING,
      TEST_STATUSES.ANALYZING,
      TEST_STATUSES.COMPLETED
    ];
    
    const currentStatusIndex = allStatuses.findIndex(status => status === booking.status);
    
    return allStatuses.map((status, index) => {
      const completed = index <= currentStatusIndex;
      const current = index === currentStatusIndex;
      
      let statusDate = "";
      if (booking.statuses) {
        const statusRecord = booking.statuses.find(s => s.status === status);
        if (statusRecord) {
          statusDate = format(new Date(statusRecord.timestamp), "MMM d, yyyy 'at' h:mm a");
        }
      }
      
      return { status, completed, current, statusDate };
    });
  };

  // Helper to get panel config for a test
  const getPanel = (testName: string) => {
    if (testName.toLowerCase().includes("cbc")) return TEST_PANELS.CBC;
    if (testName.toLowerCase().includes("lft")) return TEST_PANELS.LFT;
    if (testName.toLowerCase().includes("lipid")) return TEST_PANELS.LIPID;
    if (testName.toLowerCase().includes("hba1c")) return TEST_PANELS.HBA1C;
    if (testName.toLowerCase().includes("thyroid")) return TEST_PANELS.THYROID;
    if (testName.toLowerCase().includes("vitamin d3")) return TEST_PANELS.VITAMIN_D3;
    if (testName.toLowerCase().includes("vitamin b12")) return TEST_PANELS.VITAMIN_B12;
    if (testName.toLowerCase().includes("crp")) return TEST_PANELS.CRP;
    return null;
  };
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Active Tests</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Result Modal */}
        {resultModal.open && (() => {
          const panel = getPanel(bookings?.find(b => b.id === resultModal.bookingId)?.test?.name || "");
          if (!panel) return null;
          const requiredFields = panel.fields.filter(f => f.required);
          const isValid = requiredFields.every(f => {
            const v = resultForm[f.name];
            return v !== undefined && v !== null && v !== '' && !isNaN(Number(v)) && Number(v) > 0;
          });
          return (
            <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-lg font-bold mb-4">Enter {bookings?.find(b => b.id === resultModal.bookingId)?.test?.name} Result</h2>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (!resultModal.bookingId) return;
                    const payload = { ...resultForm };
                    panel.fields.forEach(field => {
                      if (payload[field.name] !== undefined && payload[field.name] !== '') {
                        payload[field.name] = Number(payload[field.name]);
                      }
                    });
                    cbcMutation.mutate({
                      bookingId: resultModal.bookingId,
                      values: payload,
                    });
                  }}
                  className="space-y-3"
                >
                  <div className="grid grid-cols-2 gap-2">
                    {panel.fields.map(field => (
                      <div key={field.name} className="flex flex-col">
                        <label className="text-xs font-medium mb-1">{field.label}</label>
                        <input
                          type="number"
                          step="0.01"
                          required={field.required}
                          min={field.required ? 0.01 : undefined}
                          placeholder={`${field.label}`}
                          className="input input-bordered"
                          value={resultForm[field.name] || ''}
                          onChange={e => setResultForm((f: any) => ({ ...f, [field.name]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 justify-end mt-4">
                    <Button type="button" variant="outline" onClick={() => setResultModal({ open: false })}>Cancel</Button>
                    <Button type="submit" disabled={!isValid || cbcMutation.isPending}>{cbcMutation.isPending ? "Saving..." : "Save Result"}</Button>
                  </div>
                </form>
              </div>
            </div>
          );
        })()}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : activeTests && activeTests.length > 0 ? (
          activeTests.map((booking) => (
            <div 
              key={booking.id} 
              className="border border-slate-100 dark:border-slate-700 rounded-lg p-4 mb-4 last:mb-0"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{booking.test?.name || "Test"}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Test ID: <span className="font-mono">{booking.bookingId}</span>
                  </p>
                </div>
                <div className="mt-2 md:mt-0 flex gap-2 items-center">
                  <StatusBadge status={booking.status} />
                  {/* Result Entry Button */}
                  {(() => {
                    // Debug log
                    console.log('Booking status:', booking.status, 'Test name:', booking.test?.name);
                    const panel = getPanel(booking.test?.name || "");
                    const statusStr = (booking.status || "").toLowerCase();
                    const canEnterResult =
                      panel &&
                      (statusStr === "analyzing" ||
                       statusStr === "analysis in progress" ||
                       statusStr === "completed");
                    return canEnterResult ? (
                      <Button size="sm" variant="secondary" onClick={() => setResultModal({ open: true, bookingId: booking.id, testType: booking.test?.name })}>
                        Enter Result
                      </Button>
                    ) : null;
                  })()}
                </div>
              </div>
              
              {/* Status Timeline - Collapsed by Default */}
              <Button
                variant="ghost" 
                size="sm"
                className="text-primary-600 dark:text-primary-400 text-sm font-medium flex items-center p-0 h-auto"
                onClick={() => toggleExpanded(booking.id)}
              >
                <ChevronDown className={`mr-1 h-4 w-4 transition-transform ${expandedBookings[booking.id] ? 'rotate-180' : ''}`} />
                {expandedBookings[booking.id] ? 'Hide Timeline' : 'View Timeline'}
              </Button>
              
              {expandedBookings[booking.id] && (
                <div className="relative mt-4">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700 ml-3"></div>
                  <div className="space-y-6 relative z-10">
                    {getStatusSteps(booking).map((step, idx) => {
                      // Only allow marking the next incomplete step
                      const canMark = !step.completed &&
                        idx === getStatusSteps(booking).findIndex(s => !s.completed);
                      return (
                        <div className="flex" key={idx}>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 
                            ${step.completed 
                              ? step.current 
                                ? getStatusColor(step.status) + ' animate-pulse' 
                                : 'bg-green-500' 
                              : 'bg-slate-200 dark:bg-slate-700'}`}
                          >
                            {step.completed && !step.current ? (
                              <Check className="text-white text-sm" />
                            ) : step.current ? (
                              <TestTube className="text-white text-sm" />
                            ) : (
                              <span className="material-icons-round text-slate-500 dark:text-slate-400 text-sm">
                                {idx === 4 ? 'description' : 'science'}
                              </span>
                            )}
                          </div>
                          <div className="ml-4">
                            <h4 className={`font-medium ${!step.completed && 'text-slate-400 dark:text-slate-500'}`}> 
                              {step.status === TEST_STATUSES.BOOKED && 'Test Booked'}
                              {step.status === TEST_STATUSES.SAMPLE_COLLECTED && 'Sample Collected'}
                              {step.status === TEST_STATUSES.PROCESSING && 'Sample Processing'}
                              {step.status === TEST_STATUSES.ANALYZING && 'Analysis in Progress'}
                              {step.status === TEST_STATUSES.COMPLETED && 'Report Generation'}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {step.statusDate || (step.completed ? 'Completed' : 'Pending')}
                            </p>
                            {canMark && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2"
                                disabled={statusMutation.isPending}
                                onClick={() => statusMutation.mutate({ bookingId: booking.id, status: step.status })}
                              >
                                Mark as Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <TestTube className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <h3 className="text-lg font-medium mb-2">No Active Tests</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              You don't have any active tests at the moment.
            </p>
            <Link href="/book-test">
              <Button>Book a Test</Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
