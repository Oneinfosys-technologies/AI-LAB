import { useState } from "react";
import { useParams } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import HealthInsightsCard from "@/components/health-insights/health-insights-card";
import DietPlanCard from "@/components/health-insights/diet-plan-card";
import { Activity, Utensils, MessageCircle, Heart } from "lucide-react";
import { Link } from "wouter";

// Example test results for demonstration purposes
// In a real application, these would come from the API
const mockTestResults = [
  {
    name: "Glucose",
    value: 110,
    unit: "mg/dL",
    referenceRange: "70-99",
  },
  {
    name: "Cholesterol (Total)",
    value: 210,
    unit: "mg/dL",
    referenceRange: "125-200",
  },
  {
    name: "HDL Cholesterol",
    value: 45,
    unit: "mg/dL",
    referenceRange: "≥ 40",
  },
  {
    name: "LDL Cholesterol",
    value: 130,
    unit: "mg/dL",
    referenceRange: "< 100",
  },
  {
    name: "Triglycerides",
    value: 150,
    unit: "mg/dL",
    referenceRange: "< 150",
  },
  {
    name: "Hemoglobin",
    value: 14.5,
    unit: "g/dL",
    referenceRange: "13.5-17.5",
  },
  {
    name: "Vitamin D",
    value: 25,
    unit: "ng/mL",
    referenceRange: "30-100",
  },
  {
    name: "TSH",
    value: 2.5,
    unit: "mIU/L",
    referenceRange: "0.4-4.0",
  },
];

// Mock preferences data
const mockPreferences = {
  dietaryRestrictions: ["Vegetarian"],
  allergies: ["Nuts"],
  favoriteIngredients: ["Spinach", "Berries", "Quinoa"],
  cuisinePreferences: ["Mediterranean", "Asian"],
};

export default function HealthInsightsPage() {
  const { user } = useAuth();
  const params = useParams();
  const [activeTab, setActiveTab] = useState("insights");

  // In a real app, you would fetch the report data here
  // const reportId = params.reportId;

  // For now, we're using mock data
  const testResults = mockTestResults;
  const preferences = mockPreferences;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Health Intelligence</h1>

      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="insights" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>Health Insights</span>
                </TabsTrigger>
                <TabsTrigger value="diet" className="flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  <span>Diet Plan</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>AI Health Chat</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="insights" className="mt-6">
                <HealthInsightsCard testResults={testResults} />
              </TabsContent>

              <TabsContent value="diet" className="mt-6">
                <DietPlanCard 
                  testResults={testResults} 
                  preferences={preferences}
                />
              </TabsContent>

              <TabsContent value="chat" className="mt-6">
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 mx-auto text-primary/20 mb-4" />
                  <h3 className="text-xl font-medium mb-2">Talk to our Health AI Assistant</h3>
                  <p className="text-muted-foreground mb-4">
                    Have questions about your health or test results? Our AI health assistant is here to help!
                  </p>
                  <Link href="/health-chat">
                    <Button size="lg">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Start Chat
                    </Button>
                  </Link>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}