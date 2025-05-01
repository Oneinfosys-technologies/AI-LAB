'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface CBCValues {
  hemoglobin: string;
  totalLeukocyteCount: string;
  neutrophils: string;
  lymphocytes: string;
  eosinophils: string;
  monocytes: string;
  basophils: string;
  rbcCount: string;
  pcv: string;
  mcv: string;
  mch: string;
  mchc: string;
  rdwCv: string;
  plateletCount: string;
}

interface CalculatedValues {
  mcv: string;
  mch: string;
  mchc: string;
}

export function CBCManualCalculator(): JSX.Element {
  const [values, setValues] = useState<CBCValues>({
    hemoglobin: '',
    totalLeukocyteCount: '',
    neutrophils: '',
    lymphocytes: '',
    eosinophils: '',
    monocytes: '',
    basophils: '',
    rbcCount: '',
    pcv: '',
    mcv: '',
    mch: '',
    mchc: '',
    rdwCv: '',
    plateletCount: '',
  });

  const [calculatedValues, setCalculatedValues] = useState<CalculatedValues>({
    mcv: '',
    mch: '',
    mchc: '',
  });

  const handleInputChange = (field: keyof CBCValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((prev: CBCValues) => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const calculateDerivedValues = () => {
    const hb = parseFloat(values.hemoglobin);
    const rbc = parseFloat(values.rbcCount);
    const pcv = parseFloat(values.pcv);

    if (!isNaN(pcv) && !isNaN(rbc)) {
      // MCV (Mean Corpuscular Volume) = (PCV ÷ RBC) × 10
      const mcv = ((pcv / rbc) * 10).toFixed(1);
      setCalculatedValues((prev: CalculatedValues) => ({ ...prev, mcv }));
    }

    if (!isNaN(hb) && !isNaN(rbc)) {
      // MCH (Mean Corpuscular Hemoglobin) = (Hb ÷ RBC) × 10
      const mch = ((hb / rbc) * 10).toFixed(1);
      setCalculatedValues((prev: CalculatedValues) => ({ ...prev, mch }));
    }

    if (!isNaN(hb) && !isNaN(pcv)) {
      // MCHC (Mean Corpuscular Hemoglobin Concentration) = (Hb ÷ PCV) × 100
      const mchc = ((hb / pcv) * 100).toFixed(1);
      setCalculatedValues((prev: CalculatedValues) => ({ ...prev, mchc }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>CBC Manual Calculator</CardTitle>
        <CardDescription>
          Enter the available values to calculate derived parameters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="hemoglobin">Hemoglobin (gm%)</Label>
              <Input
                id="hemoglobin"
                type="number"
                step="0.1"
                value={values.hemoglobin}
                onChange={handleInputChange('hemoglobin')}
                placeholder="11-17"
              />
            </div>
            
            <div>
              <Label htmlFor="tlc">Total Leucocyte Count (/Cu mm)</Label>
              <Input
                id="tlc"
                type="number"
                value={values.totalLeukocyteCount}
                onChange={handleInputChange('totalLeukocyteCount')}
                placeholder="4000-11000"
              />
            </div>

            <div>
              <Label htmlFor="neutrophils">Neutrophils (%)</Label>
              <Input
                id="neutrophils"
                type="number"
                value={values.neutrophils}
                onChange={handleInputChange('neutrophils')}
                placeholder="40-70"
              />
            </div>

            <div>
              <Label htmlFor="lymphocytes">Lymphocytes (%)</Label>
              <Input
                id="lymphocytes"
                type="number"
                value={values.lymphocytes}
                onChange={handleInputChange('lymphocytes')}
                placeholder="20-40"
              />
            </div>

            <div>
              <Label htmlFor="eosinophils">Eosinophils (%)</Label>
              <Input
                id="eosinophils"
                type="number"
                value={values.eosinophils}
                onChange={handleInputChange('eosinophils')}
                placeholder="1-6"
              />
            </div>

            <div>
              <Label htmlFor="monocytes">Monocytes (%)</Label>
              <Input
                id="monocytes"
                type="number"
                value={values.monocytes}
                onChange={handleInputChange('monocytes')}
                placeholder="1-10"
              />
            </div>

            <div>
              <Label htmlFor="basophils">Basophils (%)</Label>
              <Input
                id="basophils"
                type="number"
                value={values.basophils}
                onChange={handleInputChange('basophils')}
                placeholder="0-1"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="rbcCount">RBC Count (Million/cu mm)</Label>
              <Input
                id="rbcCount"
                type="number"
                step="0.1"
                value={values.rbcCount}
                onChange={handleInputChange('rbcCount')}
                placeholder="4.5-6.5"
              />
            </div>

            <div>
              <Label htmlFor="pcv">P.C.V./Hematocrit Value (%)</Label>
              <Input
                id="pcv"
                type="number"
                step="0.1"
                value={values.pcv}
                onChange={handleInputChange('pcv')}
                placeholder="40-50"
              />
            </div>

            <div>
              <Label htmlFor="mcv">M.C.V. (fl)</Label>
              <Input
                id="mcv"
                type="number"
                value={calculatedValues.mcv || values.mcv}
                onChange={handleInputChange('mcv')}
                placeholder="76-96"
                className="bg-gray-50"
                readOnly={!!calculatedValues.mcv}
              />
            </div>

            <div>
              <Label htmlFor="mch">M.C.H. (pg)</Label>
              <Input
                id="mch"
                type="number"
                value={calculatedValues.mch || values.mch}
                onChange={handleInputChange('mch')}
                placeholder="27-32"
                className="bg-gray-50"
                readOnly={!!calculatedValues.mch}
              />
            </div>

            <div>
              <Label htmlFor="mchc">M.C.H.C. (%)</Label>
              <Input
                id="mchc"
                type="number"
                value={calculatedValues.mchc || values.mchc}
                onChange={handleInputChange('mchc')}
                placeholder="32-36"
                className="bg-gray-50"
                readOnly={!!calculatedValues.mchc}
              />
            </div>

            <div>
              <Label htmlFor="rdwCv">R.D.W. - CV (%)</Label>
              <Input
                id="rdwCv"
                type="number"
                step="0.1"
                value={values.rdwCv}
                onChange={handleInputChange('rdwCv')}
                placeholder="11.0-16.5"
              />
            </div>

            <div>
              <Label htmlFor="plateletCount">Platelet Count (Lacs/cu mm)</Label>
              <Input
                id="plateletCount"
                type="number"
                step="0.1"
                value={values.plateletCount}
                onChange={handleInputChange('plateletCount')}
                placeholder="1.5-4.5"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={calculateDerivedValues} className="w-full">
            Calculate Derived Values
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 