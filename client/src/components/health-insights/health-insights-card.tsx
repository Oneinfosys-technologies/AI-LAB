import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, AlertOctagon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface HealthInsight {
  summary: string;
  abnormalValues: Array<{
    name: string;
    value: string | number;
    explanation: string;
    recommendation: string;
    severity: "normal" | "low" | "high" | "critical";
  }>;
  dietaryRecommendations: string[];
  exerciseRecommendations: string[];
  lifestyleChanges: string[];
}

interface TestResult {
  name: string;
  value: number | string;
  unit: string;
  referenceRange: string;
}

interface HealthInsightsCardProps {
  reportId?: string;
  testResults: TestResult[];
  isLoading?: boolean;
}

export default function HealthInsightsCard({ reportId, testResults, isLoading = false }: HealthInsightsCardProps) {
  const { toast } = useToast();
  const [insights, setInsights] = useState<HealthInsight | null>(null);
  const [loading, setLoading] = useState(isLoading);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "normal":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "low":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "high":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "critical":
        return <AlertOctagon className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "normal":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Normal</Badge>;
      case "low":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Low</Badge>;
      case "high":
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 hover:bg-orange-100">High</Badge>;
      case "critical":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Critical</Badge>;
      default:
        return null;
    }
  };

  const generateInsights = async () => {
    if (testResults.length === 0) {
      toast({
        title: "No test results",
        description: "There are no test results to analyze.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/health/insights", {
        testResults,
        reportId
      });

      if (!response.ok) {
        throw new Error("Failed to generate health insights");
      }

      const data = await response.json();
      setInsights(data);
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        title: "Error",
        description: "Failed to generate health insights. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>AI Health Insights</span>
          {!insights && !loading && (
            <Button onClick={generateInsights} size="sm">
              Generate Insights
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Analyzing your test results...</p>
          </div>
        ) : insights ? (
          <Tabs defaultValue="summary">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="abnormal">Abnormal Values</TabsTrigger>
              <TabsTrigger value="diet">Diet</TabsTrigger>
              <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-lg">{insights.summary}</p>
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Key Findings:</h3>
                <ul className="space-y-2">
                  {insights.abnormalValues.slice(0, 3).map((item, index) => (
                    <li key={index} className="flex items-start gap-2 p-2 border rounded-md">
                      {getSeverityIcon(item.severity)}
                      <div>
                        <span className="font-medium">{item.name}</span>: {item.value}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="abnormal" className="space-y-4">
              {insights.abnormalValues.length === 0 ? (
                <Alert>
                  <AlertTitle>Good news!</AlertTitle>
                  <AlertDescription>
                    All your test values are within normal ranges.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {insights.abnormalValues.map((item, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div 
                        className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer"
                        onClick={() => toggleItem(`abnormal-${index}`)}
                      >
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(item.severity)}
                          <h3 className="font-medium">{item.name}: {item.value}</h3>
                          {getSeverityBadge(item.severity)}
                        </div>
                        {expandedItems[`abnormal-${index}`] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                      
                      {expandedItems[`abnormal-${index}`] && (
                        <div className="p-4 space-y-2">
                          <p><strong>Explanation:</strong> {item.explanation}</p>
                          <p><strong>Recommendation:</strong> {item.recommendation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="diet" className="space-y-4">
              <h3 className="font-medium text-lg mb-2">Dietary Recommendations</h3>
              <ul className="space-y-2">
                {insights.dietaryRecommendations.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 py-1">
                    <div className="flex-shrink-0 mt-1">•</div>
                    <p>{item}</p>
                  </li>
                ))}
              </ul>
              
              <Button variant="outline" className="mt-4">
                View Complete Diet Plan
              </Button>
            </TabsContent>
            
            <TabsContent value="lifestyle" className="space-y-4">
              <div>
                <h3 className="font-medium text-lg mb-2">Exercise Recommendations</h3>
                <ul className="space-y-2">
                  {insights.exerciseRecommendations.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 py-1">
                      <div className="flex-shrink-0 mt-1">•</div>
                      <p>{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium text-lg mb-2">Lifestyle Changes</h3>
                <ul className="space-y-2">
                  {insights.lifestyleChanges.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 py-1">
                      <div className="flex-shrink-0 mt-1">•</div>
                      <p>{item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Generate AI-powered insights to better understand your health based on your test results.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}