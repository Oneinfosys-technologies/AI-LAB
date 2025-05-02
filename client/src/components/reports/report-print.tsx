import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";
import html2pdf from "html2pdf.js";

interface PatientInfo {
  name: string;
  age: string;
  sex: string;
  refBy: string;
  labRefNo: string;
  sNo: string;
  date: string;
}

interface TestPanelField {
  name: string;
  label: string;
  unit: string;
  refLow: number;
  refHigh: number;
}

interface ReportPrintProps {
  patient: PatientInfo;
  results: Record<string, any>;
  testType: string;
  comments?: string;
}

const TEST_PANELS: Record<string, { fields: TestPanelField[]; title: string }> = {
  CBC: {
    title: "CBC PROFILE",
    fields: [
      { name: "hemoglobin", label: "Hemoglobin", unit: "gm%", refLow: 11, refHigh: 17 },
      { name: "totalLeukocyteCount", label: "Total Leucocyte Count", unit: "/Cu mm", refLow: 4000, refHigh: 11000 },
      { name: "neutrophils", label: "Neutrophils", unit: "%", refLow: 40, refHigh: 70 },
      { name: "lymphocytes", label: "Lymphocytes", unit: "%", refLow: 20, refHigh: 40 },
      { name: "eosinophils", label: "Eosinophils", unit: "%", refLow: 1, refHigh: 6 },
      { name: "monocytes", label: "Monocytes", unit: "%", refLow: 1, refHigh: 10 },
      { name: "basophils", label: "Basophils", unit: "%", refLow: 0, refHigh: 1 },
      { name: "rbcCount", label: "RBC Count", unit: "Million/cu mm", refLow: 4.5, refHigh: 6.5 },
      { name: "pcv", label: "P.C.V./Hematocrit Value", unit: "%", refLow: 40, refHigh: 50 },
      { name: "mcv", label: "M.C.V.", unit: "fl", refLow: 76, refHigh: 96 },
      { name: "mch", label: "M.C.H.", unit: "pg", refLow: 27, refHigh: 32 },
      { name: "mchc", label: "M.C.H.C.", unit: "%", refLow: 32, refHigh: 36 },
      { name: "rdwCv", label: "R.D.W. - CV", unit: "%", refLow: 11, refHigh: 16.5 },
      { name: "plateletCount", label: "Platelet Count", unit: "Lacs/cu mm", refLow: 1.5, refHigh: 4.5 },
    ],
  },
  LIPID: {
    title: "LIPID PROFILE",
    fields: [
      { name: "total_cholesterol", label: "Total Cholesterol", unit: "mg/dl", refLow: 0, refHigh: 200 },
      { name: "hdl", label: "HDL Cholesterol", unit: "mg/dl", refLow: 40, refHigh: 100 },
      { name: "ldl", label: "LDL Cholesterol", unit: "mg/dl", refLow: 0, refHigh: 100 },
      { name: "triglycerides", label: "Triglycerides", unit: "mg/dl", refLow: 0, refHigh: 150 },
      { name: "vldl", label: "VLDL Cholesterol", unit: "mg/dl", refLow: 5, refHigh: 40 },
    ],
  },
  HBA1C: {
    title: "HbA1c",
    fields: [
      { name: "hba1c", label: "HbA1c", unit: "%", refLow: 4.0, refHigh: 5.6 },
    ],
  },
  THYROID: {
    title: "THYROID PROFILE",
    fields: [
      { name: "tsh", label: "TSH", unit: "µIU/mL", refLow: 0.4, refHigh: 4.0 },
      { name: "t3", label: "T3", unit: "ng/dL", refLow: 80, refHigh: 200 },
      { name: "t4", label: "T4", unit: "µg/dL", refLow: 5.1, refHigh: 14.1 },
    ],
  },
  VITAMIN_D3: {
    title: "VITAMIN D3",
    fields: [
      { name: "vitamin_d3", label: "Vitamin D3", unit: "ng/mL", refLow: 30, refHigh: 100 },
    ],
  },
  VITAMIN_B12: {
    title: "VITAMIN B12",
    fields: [
      { name: "vitamin_b12", label: "Vitamin B12", unit: "pg/mL", refLow: 200, refHigh: 900 },
    ],
  },
  CRP: {
    title: "CRP (C-Reactive Protein)",
    fields: [
      { name: "crp", label: "CRP", unit: "mg/L", refLow: 0, refHigh: 5 },
    ],
  },
};

function getFlag(value: any, refLow: number, refHigh: number) {
  if (value === undefined || value === null || value === "") return { flag: "", color: "" };
  const num = Number(value);
  if (isNaN(num)) return { flag: "", color: "" };
  if (num < refLow) return { flag: "L", color: "#2563eb" }; // blue
  if (num > refHigh) return { flag: "H", color: "#dc2626" }; // red
  return { flag: "", color: "" };
}

export const ReportPrint: React.FC<ReportPrintProps> = ({ patient, results, testType, comments }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const panelKey = Object.keys(TEST_PANELS).find(key => testType.toLowerCase().includes(key.toLowerCase())) || "CBC";
  const panel = TEST_PANELS[panelKey];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (printRef.current) {
      html2pdf().from(printRef.current).save();
    }
  };

  return (
    <div className="report-print-wrapper">
      <div ref={printRef} className="report-print bg-white p-8 max-w-2xl mx-auto border border-gray-300 shadow print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <Logo size="md" />
          <div className="text-right text-xs">
            <div>Date: {patient.date}</div>
            <div>Lab Ref. No.: {patient.labRefNo}</div>
            <div>S. No.: {patient.sNo}</div>
          </div>
        </div>
        <div className="mb-2 text-center font-bold text-lg tracking-wide">{panel.title}</div>
        <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
          <div>Patient's Name: <span className="font-semibold">{patient.name}</span></div>
          <div>Age/Sex: <span className="font-semibold">{patient.age} / {patient.sex}</span></div>
          <div>Referred by: <span className="font-semibold">{patient.refBy}</span></div>
        </div>
        {/* Table */}
        <table className="w-full text-xs border border-black mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1">TEST NAME</th>
              <th className="border border-black p-1">RESULTS</th>
              <th className="border border-black p-1">UNITS</th>
              <th className="border border-black p-1">NORMAL RANGE</th>
            </tr>
          </thead>
          <tbody>
            {panel.fields.map(field => {
              const value = results[field.name];
              const { flag, color } = getFlag(value, field.refLow, field.refHigh);
              return (
                <tr key={field.name}>
                  <td className="border border-black p-1">{field.label}</td>
                  <td className="border border-black p-1" style={{ color }}>{value} {flag && <b>({flag})</b>}</td>
                  <td className="border border-black p-1">{field.unit}</td>
                  <td className="border border-black p-1">{field.refLow}-{field.refHigh}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Interpretive Comments */}
        {comments && (
          <div className="mt-4 p-2 border border-gray-300 bg-gray-50 text-xs">
            <b>Interpretive Comments:</b> {typeof comments === "string" ? comments : JSON.stringify(comments)}
          </div>
        )}
        {/* Footer */}
        <div className="flex justify-between items-end mt-8">
          <div className="text-xs text-gray-600">
            <div>(Lab. Technologist)</div>
            <div className="mt-8 border-t border-gray-400 w-32" />
          </div>
          <div className="text-xs text-right">
            <div className="font-semibold">Dr. Vinita Maurya</div>
            <div>M.B.B.S., M.D (Path)</div>
            <div>(Consultant Pathologist)</div>
            <div>B.A.C. No. 1053</div>
            <div className="mt-8 border-t border-gray-400 w-32 ml-auto" />
          </div>
        </div>
        <div className="text-center text-xs mt-6 font-semibold">---------(End of Report)---------</div>
      </div>
      {/* Print/Download Buttons */}
      <div className="flex gap-2 justify-center mt-6 no-print">
        <Button onClick={handlePrint}>Print</Button>
        <Button onClick={handleDownloadPDF}>Download PDF</Button>
      </div>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .report-print-wrapper { box-shadow: none !important; border: none !important; }
          body { background: white !important; }
        }
        .report-print table { border-collapse: collapse; }
        .report-print th, .report-print td { border: 1px solid #000; padding: 2px 6px; }
        .report-print th { background: #f3f3f3; }
      `}</style>
    </div>
  );
}; 