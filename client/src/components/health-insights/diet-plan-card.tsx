import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Utensils, Apple, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface TestResult {
  name: string;
  value: number | string;
  unit: string;
  referenceRange: string;
}

interface DietPlan {
  summary: string;
  dailyPlan: Array<{
    day: string;
    meals: Array<{
      name: string;
      description: string;
      ingredients: string[];
      nutritionalBenefits: string;
    }>;
  }>;
  recommendations: string[];
}

interface DietPlanCardProps {
  reportId?: string;
  testResults: TestResult[];
  preferences?: {
    dietaryRestrictions?: string[];
    allergies?: string[];
    favoriteIngredients?: string[];
    cuisinePreferences?: string[];
  };
}

export default function DietPlanCard({ reportId, testResults, preferences }: DietPlanCardProps) {
  const { toast } = useToast();
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedMeals, setExpandedMeals] = useState<Record<string, boolean>>({});

  const toggleMeal = (mealKey: string) => {
    setExpandedMeals(prev => ({
      ...prev,
      [mealKey]: !prev[mealKey]
    }));
  };

  const generateDietPlan = async () => {
    if (testResults.length === 0) {
      toast({
        title: "No test results",
        description: "Test results are required to generate a personalized diet plan.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/health/diet-plan", {
        testResults,
        preferences,
        reportId
      });

      if (!response.ok) {
        throw new Error("Failed to generate diet plan");
      }

      const data = await response.json();
      setDietPlan(data);
    } catch (error) {
      console.error("Error generating diet plan:", error);
      toast({
        title: "Error",
        description: "Failed to generate diet plan. Please try again later.",
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
          <span>Personalized Diet Plan</span>
          {!dietPlan && !loading && (
            <Button onClick={generateDietPlan} size="sm">
              Generate Diet Plan
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Creating your personalized diet plan...</p>
          </div>
        ) : dietPlan ? (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Summary</h3>
              <p>{dietPlan.summary}</p>
            </div>

            <Tabs defaultValue={dietPlan.dailyPlan[0]?.day || "day-1"}>
              <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${dietPlan.dailyPlan.length}, 1fr)` }}>
                {dietPlan.dailyPlan.map((day, index) => (
                  <TabsTrigger key={index} value={day.day}>
                    {day.day}
                  </TabsTrigger>
                ))}
              </TabsList>

              {dietPlan.dailyPlan.map((day, dayIndex) => (
                <TabsContent key={dayIndex} value={day.day} className="space-y-4">
                  {day.meals.map((meal, mealIndex) => {
                    const mealKey = `${day.day}-meal-${mealIndex}`;
                    return (
                      <div key={mealKey} className="border rounded-lg overflow-hidden">
                        <div 
                          className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer"
                          onClick={() => toggleMeal(mealKey)}
                        >
                          <div className="flex items-center gap-2">
                            <Utensils className="h-5 w-5 text-primary" />
                            <h3 className="font-medium">{meal.name}</h3>
                          </div>
                          {expandedMeals[mealKey] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                        
                        {expandedMeals[mealKey] && (
                          <div className="p-4 space-y-3">
                            <p className="text-muted-foreground">{meal.description}</p>
                            
                            <div>
                              <h4 className="text-sm font-medium mb-1">Ingredients:</h4>
                              <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                                {meal.ingredients.map((ingredient, i) => (
                                  <li key={i} className="flex items-center gap-1">
                                    <Apple className="h-3 w-3 text-green-500 flex-shrink-0" />
                                    <span className="text-sm">{ingredient}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium mb-1">Health Benefits:</h4>
                              <p className="text-sm">{meal.nutritionalBenefits}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </TabsContent>
              ))}
            </Tabs>

            <div>
              <h3 className="font-medium text-lg mb-2">General Recommendations</h3>
              <ul className="space-y-2">
                {dietPlan.recommendations.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 py-1">
                    <div className="flex-shrink-0 mt-1">•</div>
                    <p>{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Generate a personalized diet plan based on your test results to help improve your health.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              The plan will include daily meals and specific nutritional recommendations tailored to your health profile.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}