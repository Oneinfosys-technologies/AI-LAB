import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/common/logo";
import html2pdf from "html2pdf.js";

interface CBCResult {
  hemoglobin?: string | number;
  totalLeukocyteCount?: string | number;
  neutrophils?: string | number;
  lymphocytes?: string | number;
  eosinophils?: string | number;
  monocytes?: string | number;
  basophils?: string | number;
  rbcCount?: string | number;
  pcv?: string | number;
  mcv?: string | number;
  mch?: string | number;
  mchc?: string | number;
  rdwCv?: string | number;
  plateletCount?: string | number;
}

interface PatientInfo {
  name: string;
  age: string;
  sex: string;
  refBy: string;
  labRefNo: string;
  sNo: string;
  date: string;
}

interface ReportPrintProps {
  patient: PatientInfo;
  cbc: CBCResult;
}

export const ReportPrint: React.FC<ReportPrintProps> = ({ patient, cbc }) => {
  const printRef = useRef<HTMLDivElement>(null);

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
        <div className="mb-2 text-center font-bold text-lg tracking-wide">CBC PROFILE</div>
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
            <tr><td className="border border-black p-1" colSpan={4}><b>HAEMATOLOGY</b></td></tr>
            <tr>
              <td className="border border-black p-1">HAEMOGLOBIN</td>
              <td className="border border-black p-1">{cbc.hemoglobin}</td>
              <td className="border border-black p-1">gm%</td>
              <td className="border border-black p-1">11-17</td>
            </tr>
            <tr>
              <td className="border border-black p-1">TOTAL LEUCOCYTE COUNT</td>
              <td className="border border-black p-1">{cbc.totalLeukocyteCount}</td>
              <td className="border border-black p-1">/Cu mm</td>
              <td className="border border-black p-1">4000-11000</td>
            </tr>
            <tr><td className="border border-black p-1" colSpan={4}><b>DIFFERENTIAL LEUCOCYTE COUNT</b></td></tr>
            <tr>
              <td className="border border-black p-1">Neutrophils</td>
              <td className="border border-black p-1">{cbc.neutrophils}</td>
              <td className="border border-black p-1">%</td>
              <td className="border border-black p-1">40-70</td>
            </tr>
            <tr>
              <td className="border border-black p-1">Lymphocytes</td>
              <td className="border border-black p-1">{cbc.lymphocytes}</td>
              <td className="border border-black p-1">%</td>
              <td className="border border-black p-1">20-40</td>
            </tr>
            <tr>
              <td className="border border-black p-1">Eosinophils</td>
              <td className="border border-black p-1">{cbc.eosinophils}</td>
              <td className="border border-black p-1">%</td>
              <td className="border border-black p-1">1-6</td>
            </tr>
            <tr>
              <td className="border border-black p-1">Monocytes</td>
              <td className="border border-black p-1">{cbc.monocytes}</td>
              <td className="border border-black p-1">%</td>
              <td className="border border-black p-1">1-10</td>
            </tr>
            <tr>
              <td className="border border-black p-1">Basophils</td>
              <td className="border border-black p-1">{cbc.basophils}</td>
              <td className="border border-black p-1">%</td>
              <td className="border border-black p-1">0-1</td>
            </tr>
            <tr><td className="border border-black p-1" colSpan={4}><b>TOTAL R.B.C. COUNT</b></td></tr>
            <tr>
              <td className="border border-black p-1">RBC Count</td>
              <td className="border border-black p-1">{cbc.rbcCount}</td>
              <td className="border border-black p-1">Million/cu mm</td>
              <td className="border border-black p-1">4.5-6.5</td>
            </tr>
            <tr>
              <td className="border border-black p-1">P.C.V./Hematocrit Value</td>
              <td className="border border-black p-1">{cbc.pcv}</td>
              <td className="border border-black p-1">%</td>
              <td className="border border-black p-1">40-50</td>
            </tr>
            <tr>
              <td className="border border-black p-1">M.C.V.</td>
              <td className="border border-black p-1">{cbc.mcv}</td>
              <td className="border border-black p-1">fl</td>
              <td className="border border-black p-1">76-96</td>
            </tr>
            <tr>
              <td className="border border-black p-1">M.C.H.</td>
              <td className="border border-black p-1">{cbc.mch}</td>
              <td className="border border-black p-1">pg</td>
              <td className="border border-black p-1">27-32</td>
            </tr>
            <tr>
              <td className="border border-black p-1">M.C.H.C.</td>
              <td className="border border-black p-1">{cbc.mchc}</td>
              <td className="border border-black p-1">%</td>
              <td className="border border-black p-1">32-36</td>
            </tr>
            <tr>
              <td className="border border-black p-1">R.D.W. - CV</td>
              <td className="border border-black p-1">{cbc.rdwCv}</td>
              <td className="border border-black p-1">%</td>
              <td className="border border-black p-1">11.0-16.5</td>
            </tr>
            <tr>
              <td className="border border-black p-1">PLATELET COUNT</td>
              <td className="border border-black p-1">{cbc.plateletCount}</td>
              <td className="border border-black p-1">Lacs/cu mm</td>
              <td className="border border-black p-1">1.5-4.5</td>
            </tr>
          </tbody>
        </table>
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