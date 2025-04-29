import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, AlertOctagon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

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
  recommendedTests: Array<{
    name: string;
    reason: string;
    urgency: "routine" | "soon" | "urgent";
  }>;
  healthTrends: Array<{
    metric: string;
    trend: "improving" | "stable" | "declining";
    explanation: string;
  }>;
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "declining":
        return <TrendingDown className="h-5 w-5 text-red-500" />;
      case "stable":
        return <Minus className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "routine":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Routine</Badge>;
      case "soon":
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Soon</Badge>;
      case "urgent":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Urgent</Badge>;
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
            <TabsList className="grid grid-cols-6 mb-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="abnormal">Abnormal Values</TabsTrigger>
              <TabsTrigger value="trends">Health Trends</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="tests">Recommended Tests</TabsTrigger>
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

            <TabsContent value="trends" className="space-y-4">
              {insights.healthTrends.length === 0 ? (
                <Alert>
                  <AlertTitle>No trend data available</AlertTitle>
                  <AlertDescription>
                    We need more test results over time to analyze health trends.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {insights.healthTrends.map((trend, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{trend.metric}</h3>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(trend.trend)}
                          <Badge variant="outline" className={
                            trend.trend === "improving" ? "bg-green-100 text-green-800" :
                            trend.trend === "declining" ? "bg-red-100 text-red-800" :
                            "bg-blue-100 text-blue-800"
                          }>
                            {trend.trend.charAt(0).toUpperCase() + trend.trend.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400">{trend.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="font-medium">Dietary Recommendations</h3>
                  <ul className="space-y-2">
                    {insights.dietaryRecommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-medium">Exercise Recommendations</h3>
                  <ul className="space-y-2">
                    {insights.exerciseRecommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tests" className="space-y-4">
              {insights.recommendedTests.length === 0 ? (
                <Alert>
                  <AlertTitle>No additional tests recommended</AlertTitle>
                  <AlertDescription>
                    Based on your current results, no additional tests are recommended at this time.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {insights.recommendedTests.map((test, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{test.name}</h3>
                        {getUrgencyBadge(test.urgency)}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">{test.reason}</p>
                      <Button size="sm" asChild>
                        <Link href={`/tests?search=${encodeURIComponent(test.name)}`}>
                          Book This Test
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="lifestyle" className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-medium">Lifestyle Changes</h3>
                <ul className="space-y-2">
                  {insights.lifestyleChanges.map((change, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-1" />
                      <span>{change}</span>
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