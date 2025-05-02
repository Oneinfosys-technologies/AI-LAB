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

const CBC_DIRECT_FIELDS: TestPanelField[] = [
  { name: "hemoglobin", label: "Hemoglobin (Hgb)", unit: "g/dL", refLow: 11, refHigh: 17 },
  { name: "hematocrit", label: "Hematocrit (Hct)", unit: "%", refLow: 36, refHigh: 50 },
  { name: "rbcCount", label: "RBC Count", unit: "million/µL", refLow: 4.5, refHigh: 6.5 },
  { name: "wbcCount", label: "WBC Count (TLC)", unit: "×10³/µL", refLow: 4, refHigh: 11 },
  { name: "plateletCount", label: "Platelet Count (PLC)", unit: "×10³/µL", refLow: 150, refHigh: 450 },
  { name: "neutrophils", label: "Neutrophils (%)", unit: "%", refLow: 40, refHigh: 70 },
  { name: "lymphocytes", label: "Lymphocytes (%)", unit: "%", refLow: 20, refHigh: 40 },
  { name: "eosinophils", label: "Eosinophils (%)", unit: "%", refLow: 1, refHigh: 6 },
  { name: "monocytes", label: "Monocytes (%)", unit: "%", refLow: 1, refHigh: 10 },
  { name: "basophils", label: "Basophils (%)", unit: "%", refLow: 0, refHigh: 1 },
];

const CBC_CALC_FIELDS = [
  { name: "mcv", label: "MCV (Mean Corpuscular Volume)", unit: "fL", refLow: 80, refHigh: 100 },
  { name: "mch", label: "MCH (Mean Corpuscular Hemoglobin)", unit: "pg", refLow: 27, refHigh: 32 },
  { name: "mchc", label: "MCHC (Mean Corpuscular Hemoglobin Concentration)", unit: "g/dL", refLow: 32, refHigh: 36 },
  { name: "anc", label: "ANC (Absolute Neutrophil Count)", unit: "×10³/µL", refLow: 1.5, refHigh: 8 },
];

function validateDirectValue(value: any, field: TestPanelField) {
  if (value === undefined || value === null || value === "") return { valid: false, error: "Missing" };
  const num = Number(value);
  if (isNaN(num) || num <= 0) return { valid: false, error: "Invalid (≤0)" };
  return { valid: true, error: "" };
}

function getFlagWithInterpretation(value: any, refLow: number, refHigh: number, label: string) {
  if (value === undefined || value === null || value === "") return { flag: "", color: "", interp: "" };
  const num = Number(value);
  if (isNaN(num)) return { flag: "", color: "", interp: "" };
  if (num < refLow) return { flag: "L", color: "#2563eb", interp: label === "MCV (Mean Corpuscular Volume)" ? "Microcytic" : "Low" };
  if (num > refHigh) return { flag: "H", color: "#dc2626", interp: label === "MCV (Mean Corpuscular Volume)" ? "Macrocytic" : "High" };
  return { flag: "", color: "", interp: "Normal" };
}

function calculateCBC(results: Record<string, any>) {
  const hct = Number(results.hematocrit);
  const rbc = Number(results.rbcCount);
  const hgb = Number(results.hemoglobin);
  const wbc = Number(results.wbcCount);
  const neutro = Number(results.neutrophils);
  let mcv = "", mch = "", mchc = "", anc = "";
  let errors: string[] = [];
  if (rbc > 0) {
    mcv = ((hct / rbc) * 10).toFixed(1);
    mch = ((hgb / rbc) * 10).toFixed(1);
  } else {
    errors.push("RBC must be > 0 for MCV/MCH");
  }
  if (hct > 0) {
    mchc = ((hgb / hct) * 100).toFixed(1);
  } else {
    errors.push("Hct must be > 0 for MCHC");
  }
  if (wbc > 0) {
    anc = (wbc * (neutro / 100)).toFixed(1);
  } else {
    errors.push("WBC must be > 0 for ANC");
  }
  return { mcv, mch, mchc, anc, errors };
}

function cbcInterpretation(results: Record<string, any>, calc: any) {
  const mcv = Number(calc.mcv);
  const mch = Number(calc.mch);
  if (mcv < 80 && mch < 27) return "Iron deficiency anemia suspected.";
  if (mcv > 100) return "Macrocytic anemia pattern.";
  if (Number(results.hemoglobin) < 11) return "Anemia (low hemoglobin).";
  return "CBC within normal limits.";
}

export const ReportPrint: React.FC<ReportPrintProps> = ({ patient, results, testType, comments }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const isCBC = testType.toLowerCase().includes("cbc");
  let calc = { mcv: "", mch: "", mchc: "", anc: "", errors: [] as string[] };
  if (isCBC) {
    calc = calculateCBC(results);
  }
  const handlePrint = () => { window.print(); };
  const handleDownloadPDF = () => { if (printRef.current) { html2pdf().from(printRef.current).save(); } };
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
        <div className="mb-2 text-center font-bold text-lg tracking-wide">CBC PROFILE</div>
        <div className="mb-4 grid grid-cols-2 gap-2 text-xs">
          <div>Patient's Name: <span className="font-semibold">{patient.name}</span></div>
          <div>Age/Sex: <span className="font-semibold">{patient.age} / {patient.sex}</span></div>
          <div>Referred by: <span className="font-semibold">{patient.refBy}</span></div>
        </div>
        {/* Directly Measured Section */}
        <div className="font-semibold mt-4 mb-1">Directly Measured:</div>
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
            {CBC_DIRECT_FIELDS.map(field => {
              const value = results[field.name];
              const { valid, error } = validateDirectValue(value, field);
              const { flag, color } = getFlagWithInterpretation(value, field.refLow, field.refHigh, field.label);
              return (
                <tr key={field.name}>
                  <td className="border border-black p-1">{field.label}</td>
                  <td className="border border-black p-1" style={{ color }}>{!valid ? <span style={{color:'#dc2626'}}>{error}</span> : value} {flag && <b>({flag})</b>}</td>
                  <td className="border border-black p-1">{field.unit}</td>
                  <td className="border border-black p-1">{field.refLow}-{field.refHigh}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Calculated Section */}
        <div className="font-semibold mt-4 mb-1">Calculated:</div>
        <table className="w-full text-xs border border-black mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1">PARAMETER</th>
              <th className="border border-black p-1">VALUE</th>
              <th className="border border-black p-1">UNITS</th>
              <th className="border border-black p-1">NORMAL RANGE</th>
              <th className="border border-black p-1">INTERPRETATION</th>
            </tr>
          </thead>
          <tbody>
            {CBC_CALC_FIELDS.map(field => {
              const value = (calc as any)[field.name] as string;
              const { flag, color, interp } = getFlagWithInterpretation(value, field.refLow, field.refHigh, field.label);
              return (
                <tr key={field.name}>
                  <td className="border border-black p-1">{field.label}</td>
                  <td className="border border-black p-1" style={{ color }}>{value} {flag && <b>({flag})</b>}</td>
                  <td className="border border-black p-1">{field.unit}</td>
                  <td className="border border-black p-1">{field.refLow}-{field.refHigh}</td>
                  <td className="border border-black p-1">{interp}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Calculation Errors */}
        {calc.errors.length > 0 && (
          <div className="text-xs text-red-600 mb-2">Calculation errors: {calc.errors.join(", ")}</div>
        )}
        {/* Interpretive Comments */}
        <div className="mt-4 p-2 border border-gray-300 bg-gray-50 text-xs">
          <b>Interpretive Comments:</b> {cbcInterpretation(results, calc)}
        </div>
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