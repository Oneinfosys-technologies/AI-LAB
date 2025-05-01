'use client';

import { useState } from 'react';
import { TestResultForm } from '@/components/tests/test-result-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const TEST_TYPES = [
  { id: 'cbc', name: 'Complete Blood Count (CBC)' },
  { id: 'vidal', name: 'Widal Test' },
  { id: 'blood_sugar', name: 'Blood Sugar' },
];

export default function TestResultEntryPage() {
  const [selectedTest, setSelectedTest] = useState<string>('');

  const handleTestSelect = (testId: string) => {
    setSelectedTest(testId);
  };

  const handleResultSubmit = (values: Record<string, string>) => {
    console.log('Test Results:', values);
    // Here you would typically save the results to your backend
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Test Result Entry</h1>
      
      <div className="mb-8 max-w-xs">
        <Label htmlFor="test-select">Select Test Type</Label>
        <Select value={selectedTest} onValueChange={handleTestSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a test" />
          </SelectTrigger>
          <SelectContent>
            {TEST_TYPES.map(test => (
              <SelectItem key={test.id} value={test.id}>
                {test.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTest && (
        <TestResultForm 
          testId={selectedTest} 
          onSubmit={handleResultSubmit}
        />
      )}
    </div>
  );
} 