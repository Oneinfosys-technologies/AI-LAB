'use client';

import { useState } from 'react';
import { TestResultForm } from '@/components/tests/test-result-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const TEST_TYPES = [
  { id: 'cbc', name: 'Complete Blood Count (CBC)' },
  { id: 'vidal', name: 'Widal Test' },
  { id: 'blood_sugar', name: 'Blood Sugar' },
];

export default function AdminTestResultEntryPage() {
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [patientId, setPatientId] = useState<string>('');
  const [patientInfo, setPatientInfo] = useState<any>(null);

  const handleTestSelect = (testId: string) => {
    setSelectedTest(testId);
  };

  const handlePatientSearch = () => {
    // Here you would typically fetch patient info from your backend
    console.log('Searching for patient:', patientId);
    // Mock patient info for demonstration
    setPatientInfo({
      id: patientId,
      name: 'John Doe',
      age: 30,
      gender: 'Male'
    });
  };

  const handleResultSubmit = (values: Record<string, string>) => {
    const testResult = {
      patientId,
      patientInfo,
      testType: selectedTest,
      results: values,
      timestamp: new Date().toISOString(),
      enteredBy: 'Current Admin User' // You would get this from your auth context
    };
    console.log('Test Results:', testResult);
    // Here you would typically save the results to your backend
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Test Result Entry (Admin)</h1>
      
      <div className="grid gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="patient-id">Patient ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="patient-id"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    placeholder="Enter patient ID"
                  />
                  <Button onClick={handlePatientSearch}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </div>

            {patientInfo && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="text-sm">{patientInfo.name}</p>
                </div>
                <div>
                  <Label>Age</Label>
                  <p className="text-sm">{patientInfo.age}</p>
                </div>
                <div>
                  <Label>Gender</Label>
                  <p className="text-sm">{patientInfo.gender}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {patientInfo && (
          <>
            <div className="max-w-xs">
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
          </>
        )}
      </div>
    </div>
  );
} 