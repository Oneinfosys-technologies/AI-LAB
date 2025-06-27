'use client';

import { useState } from 'react';
import { TestResultForm } from '@/components/tests/test-result-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useQueryClient } from '@tanstack/react-query';

const TEST_TYPES = [
  { id: 'cbc', name: 'Complete Blood Count (CBC)' },
  { id: 'vidal', name: 'Widal Test' },
  { id: 'blood_sugar', name: 'Blood Sugar' },
  { id: 'lipid_profile', name: 'Lipid Profile' },
  { id: 'hba1c', name: 'HbA1c' },
  { id: 'thyroid_profile', name: 'Thyroid Profile' },
  { id: 'vitamin_d3', name: 'Vitamin D3' },
  { id: 'vitamin_b12', name: 'Vitamin B12' },
  { id: 'crp', name: 'CRP (C-Reactive Protein)' },
];

export default function AdminTestResultEntryPage() {
  const { user, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTest, setSelectedTest] = useState<string>('');
  const [patientId, setPatientId] = useState<string>('');
  const [patientInfo, setPatientInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const handleResultSubmit = async (values: Record<string, string>) => {
    setError(null);
    setSuccess(null);
    try {
      // You would typically get the bookingId from patientInfo or a search result
      const bookingId = patientInfo?.id;
      if (!bookingId) {
        setError('No booking/patient selected.');
        return;
      }
      const response = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          results: values,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.message || 'Failed to save test results.');
        return;
      }
      setSuccess('Test results saved successfully!');
      // Invalidate queries to refresh report history for both admin and patient
      queryClient.invalidateQueries(["/api/admin/reports"]);
      queryClient.invalidateQueries(["/api/reports"]);
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return <div className="text-red-600 font-bold text-center py-10">Access Denied: Admins only</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Test Result Entry (Admin)</h1>
      {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
      {success && <div className="mb-4 text-green-600 font-semibold">{success}</div>}
      
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