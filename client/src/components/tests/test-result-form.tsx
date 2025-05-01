'use client';

import * as React from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TestParameter {
  id: string;
  name: string;
  unit: string;
  normalRange: string;
  type: 'number' | 'text' | 'select';
  options?: string[];
  step?: string;
  calculated?: boolean;
  formula?: (values: Record<string, string>) => string;
}

interface TestDefinition {
  id: string;
  name: string;
  description: string;
  parameters: TestParameter[];
}

// Example test definitions
const TEST_DEFINITIONS: TestDefinition[] = [
  {
    id: 'cbc',
    name: 'Complete Blood Count (CBC)',
    description: 'Measures various components of blood including red cells, white cells, and platelets',
    parameters: [
      { id: 'hemoglobin', name: 'Hemoglobin', unit: 'gm%', normalRange: '11-17', type: 'number', step: '0.1' },
      { id: 'tlc', name: 'Total Leucocyte Count', unit: '/Cu mm', normalRange: '4000-11000', type: 'number' },
      { id: 'neutrophils', name: 'Neutrophils', unit: '%', normalRange: '40-70', type: 'number' },
      { id: 'lymphocytes', name: 'Lymphocytes', unit: '%', normalRange: '20-40', type: 'number' },
      { id: 'eosinophils', name: 'Eosinophils', unit: '%', normalRange: '1-6', type: 'number' },
      { id: 'monocytes', name: 'Monocytes', unit: '%', normalRange: '1-10', type: 'number' },
      { id: 'basophils', name: 'Basophils', unit: '%', normalRange: '0-1', type: 'number' },
      { id: 'rbcCount', name: 'RBC Count', unit: 'Million/cu mm', normalRange: '4.5-6.5', type: 'number', step: '0.1' },
      { id: 'pcv', name: 'P.C.V./Hematocrit Value', unit: '%', normalRange: '40-50', type: 'number', step: '0.1' },
      { id: 'mcv', name: 'M.C.V.', unit: 'fl', normalRange: '76-96', type: 'number', calculated: true },
      { id: 'mch', name: 'M.C.H.', unit: 'pg', normalRange: '27-32', type: 'number', calculated: true },
      { id: 'mchc', name: 'M.C.H.C.', unit: '%', normalRange: '32-36', type: 'number', calculated: true },
      { id: 'rdwCv', name: 'R.D.W. - CV', unit: '%', normalRange: '11.0-16.5', type: 'number', step: '0.1' },
      { id: 'plateletCount', name: 'Platelet Count', unit: 'Lacs/cu mm', normalRange: '1.5-4.5', type: 'number', step: '0.1' },
    ]
  },
  {
    id: 'vidal',
    name: 'Widal Test',
    description: 'Test for typhoid fever',
    parameters: [
      { 
        id: 'salmonellaTyphi_O', 
        name: 'Salm. Typhi "O"', 
        unit: '', 
        normalRange: '<1:40', 
        type: 'select',
        options: ['Negative', '1:20', '1:40', '1:80', '1:160', '1:320']
      },
      { 
        id: 'salmonellaTyphi_H', 
        name: 'Salm. Typhi "H"', 
        unit: '', 
        normalRange: '<1:40', 
        type: 'select',
        options: ['Negative', '1:20', '1:40', '1:80', '1:160', '1:320']
      },
      { 
        id: 'salmonellaParaTyphi_AH', 
        name: 'Salm. Para Typhi A "H"', 
        unit: '', 
        normalRange: '<1:40', 
        type: 'select',
        options: ['Negative', '1:20', '1:40', '1:80', '1:160', '1:320']
      },
      { 
        id: 'salmonellaParaTyphi_BH', 
        name: 'Salm. Para Typhi B "H"', 
        unit: '', 
        normalRange: '<1:40', 
        type: 'select',
        options: ['Negative', '1:20', '1:40', '1:80', '1:160', '1:320']
      }
    ]
  },
  {
    id: 'blood_sugar',
    name: 'Blood Sugar',
    description: 'Measures blood glucose levels',
    parameters: [
      { 
        id: 'fasting', 
        name: 'Fasting Blood Sugar', 
        unit: 'mg/dl', 
        normalRange: '70-100', 
        type: 'number', 
        step: '0.1' 
      },
      { 
        id: 'pp', 
        name: 'Post Prandial Blood Sugar', 
        unit: 'mg/dl', 
        normalRange: '70-140', 
        type: 'number', 
        step: '0.1' 
      },
      { 
        id: 'random', 
        name: 'Random Blood Sugar', 
        unit: 'mg/dl', 
        normalRange: '80-140', 
        type: 'number', 
        step: '0.1' 
      }
    ]
  }
];

interface TestResultFormProps {
  testId: string;
  onSubmit?: (values: Record<string, string>) => void;
}

export function TestResultForm({ testId, onSubmit }: TestResultFormProps) {
  const test = TEST_DEFINITIONS.find(t => t.id === testId);
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [calculatedValues, setCalculatedValues] = React.useState<Record<string, string>>({});

  if (!test) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Test type not found</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleInputChange = (parameterId: string, value: string) => {
    setValues(prev => ({
      ...prev,
      [parameterId]: value
    }));
  };

  const calculateDerivedValues = () => {
    if (testId === 'cbc') {
      const hb = parseFloat(values.hemoglobin || '0');
      const rbc = parseFloat(values.rbcCount || '0');
      const pcv = parseFloat(values.pcv || '0');

      if (!isNaN(pcv) && !isNaN(rbc)) {
        const mcv = ((pcv / rbc) * 10).toFixed(1);
        setCalculatedValues(prev => ({ ...prev, mcv }));
      }

      if (!isNaN(hb) && !isNaN(rbc)) {
        const mch = ((hb / rbc) * 10).toFixed(1);
        setCalculatedValues(prev => ({ ...prev, mch }));
      }

      if (!isNaN(hb) && !isNaN(pcv)) {
        const mchc = ((hb / pcv) * 100).toFixed(1);
        setCalculatedValues(prev => ({ ...prev, mchc }));
      }
    }
  };

  const handleSubmit = () => {
    const allValues = {
      ...values,
      ...calculatedValues
    };
    onSubmit?.(allValues);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{test.name}</CardTitle>
        <CardDescription>{test.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {test.parameters.map(param => (
            <div key={param.id} className="space-y-2">
              <Label htmlFor={param.id}>
                {param.name} {param.unit && `(${param.unit})`}
              </Label>
              {param.type === 'select' ? (
                <Select
                  value={values[param.id] || ''}
                  onValueChange={(value) => handleInputChange(param.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select value" />
                  </SelectTrigger>
                  <SelectContent>
                    {param.options?.map(option => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={param.id}
                  type={param.type}
                  step={param.step}
                  value={param.calculated ? calculatedValues[param.id] || values[param.id] : values[param.id] || ''}
                  onChange={(e) => handleInputChange(param.id, e.target.value)}
                  placeholder={`Normal Range: ${param.normalRange}`}
                  className={param.calculated ? "bg-gray-50" : ""}
                  readOnly={param.calculated && !!calculatedValues[param.id]}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2">
          {testId === 'cbc' && (
            <Button onClick={calculateDerivedValues} className="w-full mb-2">
              Calculate Derived Values
            </Button>
          )}
          <Button onClick={handleSubmit} className="w-full">
            Save Results
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 