export interface CBCInput {
  hemoglobin: number; // g/dL
  hematocrit: number; // %
  rbc: number;        // million cells/uL
  wbc: number;        // thousand cells/uL
  platelet: number;   // thousand cells/uL
}

export interface CBCCalculated {
  mcv: number;   // fL
  mch: number;   // pg
  mchc: number;  // g/dL
}

export interface CBCResult extends CBCInput, CBCCalculated {}

export function calculateCBC(input: CBCInput): CBCResult {
  // MCV = (Hematocrit / RBC count) × 10
  // MCH = (Hemoglobin / RBC count) × 10
  // MCHC = (Hemoglobin / Hematocrit) × 100
  const { hemoglobin, hematocrit, rbc } = input;
  const mcv = rbc ? (hematocrit / rbc) * 10 : 0;
  const mch = rbc ? (hemoglobin / rbc) * 10 : 0;
  const mchc = hematocrit ? (hemoglobin / hematocrit) * 100 : 0;
  return {
    ...input,
    mcv: Number(mcv.toFixed(2)),
    mch: Number(mch.toFixed(2)),
    mchc: Number(mchc.toFixed(2)),
  };
} 