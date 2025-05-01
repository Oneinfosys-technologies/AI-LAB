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

interface ReferenceRanges {
  [key: string]: {
    min: number;
    max: number;
    unit: string;
  };
}

const REFERENCE_RANGES: ReferenceRanges = {
  hemoglobin: { min: 11, max: 17, unit: 'gm%' },
  totalLeukocyteCount: { min: 4000, max: 11000, unit: '/Cu mm' },
  neutrophils: { min: 40, max: 70, unit: '%' },
  lymphocytes: { min: 20, max: 40, unit: '%' },
  eosinophils: { min: 1, max: 6, unit: '%' },
  monocytes: { min: 1, max: 10, unit: '%' },
  basophils: { min: 0, max: 1, unit: '%' },
  rbcCount: { min: 4.5, max: 6.5, unit: 'Million/cu mm' },
  pcv: { min: 40, max: 50, unit: '%' },
  mcv: { min: 76, max: 96, unit: 'fl' },
  mch: { min: 27, max: 32, unit: 'pg' },
  mchc: { min: 32, max: 36, unit: '%' },
  rdwCv: { min: 11.5, max: 14.5, unit: '%' },
  plateletCount: { min: 150000, max: 450000, unit: '/Cu mm' },
};

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

  const [errors, setErrors] = useState<Partial<Record<keyof CBCValues, string>>>({});
  const [isCalculated, setIsCalculated] = useState(false);

  const validateValue = (field: keyof CBCValues, value: string): string | undefined => {
    if (!value) return undefined;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'Please enter a valid number';
    
    const range = REFERENCE_RANGES[field];
    if (numValue < range.min || numValue > range.max) {
      return `Value should be between ${range.min} and ${range.max} ${range.unit}`;
    }
    return undefined;
  };

  const handleInputChange = (field: keyof CBCValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValues((prev: CBCValues) => ({
      ...prev,
      [field]: value
    }));
    
    const error = validateValue(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const calculateDerivedValues = () => {
    const newErrors: Partial<Record<keyof CBCValues, string>> = {};
    let hasErrors = false;

    // Validate all required fields
    Object.keys(values).forEach((field) => {
      const error = validateValue(field as keyof CBCValues, values[field as keyof CBCValues]);
      if (error) {
        newErrors[field as keyof CBCValues] = error;
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    const hb = parseFloat(values.hemoglobin);
    const rbc = parseFloat(values.rbcCount);
    const pcv = parseFloat(values.pcv);

    if (!isNaN(pcv) && !isNaN(rbc)) {
      const mcv = ((pcv / rbc) * 10).toFixed(1);
      setCalculatedValues((prev: CalculatedValues) => ({ ...prev, mcv }));
    }

    if (!isNaN(hb) && !isNaN(rbc)) {
      const mch = ((hb / rbc) * 10).toFixed(1);
      setCalculatedValues((prev: CalculatedValues) => ({ ...prev, mch }));
    }

    if (!isNaN(hb) && !isNaN(pcv)) {
      const mchc = ((hb / pcv) * 100).toFixed(1);
      setCalculatedValues((prev: CalculatedValues) => ({ ...prev, mchc }));
    }

    setIsCalculated(true);
  };

  const resetCalculator = () => {
    setValues({
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
    setCalculatedValues({
      mcv: '',
      mch: '',
      mchc: '',
    });
    setErrors({});
    setIsCalculated(false);
  };

  const exportResults = () => {
    const results = {
      ...values,
      ...calculatedValues,
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cbc-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
            {Object.entries(REFERENCE_RANGES).map(([field, range]) => (
              <div key={field}>
                <Label htmlFor={field}>
                  {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} ({range.unit})
                </Label>
                <Input
                  id={field}
                  type="number"
                  step={field === 'hemoglobin' || field === 'rbcCount' || field === 'pcv' ? '0.1' : '1'}
                  value={values[field as keyof CBCValues]}
                  onChange={handleInputChange(field as keyof CBCValues)}
                  placeholder={`${range.min}-${range.max}`}
                  className={errors[field as keyof CBCValues] ? 'border-red-500' : ''}
                />
                {errors[field as keyof CBCValues] && (
                  <p className="text-sm text-red-500 mt-1">{errors[field as keyof CBCValues]}</p>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex gap-4 mb-4">
              <Button onClick={calculateDerivedValues} className="flex-1">
                Calculate
              </Button>
              <Button onClick={resetCalculator} variant="outline" className="flex-1">
                Reset
              </Button>
              {isCalculated && (
                <Button onClick={exportResults} variant="secondary" className="flex-1">
                  Export Results
                </Button>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Calculated Values</h3>
              <div className="space-y-2">
                <div>
                  <Label>M.C.V. (fl)</Label>
                  <Input
                    value={calculatedValues.mcv || values.mcv}
                    readOnly
                    className="bg-white"
                  />
                </div>
                <div>
                  <Label>M.C.H. (pg)</Label>
                  <Input
                    value={calculatedValues.mch || values.mch}
                    readOnly
                    className="bg-white"
                  />
                </div>
                <div>
                  <Label>M.C.H.C. (%)</Label>
                  <Input
                    value={calculatedValues.mchc || values.mchc}
                    readOnly
                    className="bg-white"
                  />
                </div>
              </div>
            </div>

            {isCalculated && (
              <div className="bg-blue-50 p-4 rounded-lg mt-4">
                <h3 className="font-semibold mb-2">Interpretation</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {Object.entries(calculatedValues).map(([key, value]) => {
                    const range = REFERENCE_RANGES[key as keyof typeof REFERENCE_RANGES];
                    const numValue = parseFloat(value);
                    let interpretation = '';
                    
                    if (numValue < range.min) {
                      interpretation = 'Low';
                    } else if (numValue > range.max) {
                      interpretation = 'High';
                    } else {
                      interpretation = 'Normal';
                    }
                    
                    return (
                      <li key={key}>
                        {key.toUpperCase()}: {value} {range.unit} - {interpretation}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 