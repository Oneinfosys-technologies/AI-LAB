import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize the Gemini API
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error("GOOGLE_API_KEY is required in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Safety settings to ensure appropriate responses for health content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// System instructions for all prompts
const LAB_ASSISTANT_PROMPT = `You are an expert Lab Management Assistant. Always recommend lab tests, explain medical terms simply, follow ISO lab standards, and behave professionally. You strictly follow NABL/ISO standards when suggesting. Explain abnormal results in very simple language.`;

// Interface for test results
export interface TestResult {
  name: string;
  value: number | string;
  unit: string;
  referenceRange: string;
}

// Interface for health insights response
export interface HealthInsight {
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

// Interface for test insights response (this matches the OpenAI format for backward compatibility)
export interface InsightResponse {
  summary: string;
  abnormalValues: Array<{
    name: string;
    value: string | number;
    explanation: string;
    recommendation: string;
    severity: "normal" | "low" | "high" | "critical";
  }>;
  recommendations: string[];
}

// Interface for a chat history entry
export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

// Generate test insights compatible with previous OpenAI format
export async function generateTestInsights(results: TestResult[]): Promise<InsightResponse> {
  try {
    // For normal reference range analysis, we'll do that on our own
    const abnormalValues = results.filter(result => {
      if (typeof result.value === 'number') {
        const range = result.referenceRange.split('-').map(r => parseFloat(r.trim()));
        return result.value < range[0] || result.value > range[1];
      }
      return false;
    });

    // Prepare the abnormal values for better analysis
    const abnormalValuesInfo = abnormalValues.map(item => {
      const range = item.referenceRange.split('-').map(r => parseFloat(r.trim()));
      const value = typeof item.value === 'number' ? item.value : parseFloat(String(item.value));
      const isLow = value < range[0];

      return {
        name: item.name,
        value: item.value,
        unit: item.unit,
        referenceRange: item.referenceRange,
        status: isLow ? "low" : "high"
      };
    });

    // If there are abnormal values, get detailed insights
    if (abnormalValues.length > 0) {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        safetySettings,
      });

      const prompt = `
${LAB_ASSISTANT_PROMPT}

You are a medical laboratory AI assistant providing insights on test results.
Analyze these abnormal lab results, providing clear explanations and actionable recommendations.
For each abnormal value, explain what it means in plain language for the patient and give appropriate health recommendations.
Be informative but not alarmist, and always recommend consulting a healthcare provider.

Test results with abnormal values:
${JSON.stringify(abnormalValuesInfo, null, 2)}

Provide analysis in the following JSON format:
{
  "summary": "A 1-2 sentence overview of the test results",
  "abnormalValues": [
    {
      "name": "Test name",
      "value": "Value",
      "explanation": "Clear explanation of what this means in plain language",
      "recommendation": "Specific recommendation for this value",
      "severity": "low/high/critical"
    }
  ],
  "recommendations": ["3-5 general health recommendations based on these results"]
}`;

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
      });

      const response = result.response;
      const text = response.text();

      try {
        const aiResponse = JSON.parse(text);
        return aiResponse;
      } catch (error) {
        console.error("Failed to parse Gemini response:", error);
        throw new Error("Failed to parse insights response");
      }
    } else {
      // If no abnormal values, generate a more general response
      return {
        summary: "Great news! All your test results are within normal ranges.",
        abnormalValues: [],
        recommendations: [
          "Continue maintaining your current health routine.",
          "Stay hydrated by drinking adequate water throughout the day.",
          "Engage in regular physical activity for at least 30 minutes daily.",
          "Ensure you get 7-8 hours of quality sleep each night.",
          "Schedule regular check-ups to monitor your health proactively."
        ]
      };
    }
  } catch (error) {
    console.error("Error generating insights with Gemini:", error);
    throw new Error("Failed to generate insights. Please try again later.");
  }
}

// Generate health insights from test results
export async function generateHealthInsights(
  testResults: TestResult[],
  userContext?: {
    age?: number;
    gender?: string;
    knownConditions?: string[];
    previousResults?: TestResult[];
  }
): Promise<HealthInsight> {
  try {
    // Get the model and start generation
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      safetySettings,
    });

    // Format the test results for analysis
    const formattedResults = testResults
      .map(
        (result) =>
          `${result.name}: ${result.value} ${result.unit} (Reference Range: ${result.referenceRange})`
      )
      .join("\n");

    // Format previous results if available
    let previousResultsStr = "";
    if (userContext?.previousResults?.length) {
      previousResultsStr = "\nPrevious Test Results:\n" + userContext.previousResults
        .map(
          (result) =>
            `${result.name}: ${result.value} ${result.unit} (Reference Range: ${result.referenceRange})`
        )
        .join("\n");
    }

    // Create the prompt with system context and test results
    const prompt = `
${LAB_ASSISTANT_PROMPT}

You are a highly skilled AI medical assistant helping patients understand their lab test results. 
You provide clear, accurate, and personalized advice based strictly on the provided test results.

Patient Context:
${userContext?.age ? `Age: ${userContext.age}\n` : ""}
${userContext?.gender ? `Gender: ${userContext.gender}\n` : ""}
${userContext?.knownConditions?.length ? `Known Conditions: ${userContext.knownConditions.join(", ")}\n` : ""}

Current Test Results:
${formattedResults}
${previousResultsStr}

Please provide your analysis in the following JSON format:
{
  "summary": "A brief summary of the overall health status based on these results",
  "abnormalValues": [
    {
      "name": "Name of the test",
      "value": "Value of the test",
      "explanation": "Clear explanation of what this abnormal value means",
      "recommendation": "Specific recommendations for addressing this issue",
      "severity": "One of: normal, low, high, critical"
    }
  ],
  "dietaryRecommendations": ["List of specific dietary recommendations based on the results"],
  "exerciseRecommendations": ["List of specific exercise recommendations based on the results"],
  "lifestyleChanges": ["List of lifestyle changes that might help improve abnormal values"],
  "recommendedTests": [
    {
      "name": "Name of recommended test",
      "reason": "Reason for recommending this test",
      "urgency": "One of: routine, soon, urgent"
    }
  ],
  "healthTrends": [
    {
      "metric": "Name of the health metric",
      "trend": "One of: improving, stable, declining",
      "explanation": "Explanation of the trend"
    }
  ]
}

Important: 
1. Be precise and personalized. Only include abnormal values that are outside their reference ranges.
2. Provide helpful, actionable recommendations for each abnormal value.
3. Consider the patient's context when making recommendations.
4. If previous results are available, analyze trends and changes.
5. Recommend additional tests only if medically relevant and necessary.
6. Always emphasize consulting with healthcare professionals for medical advice.
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    });

    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    try {
      const insights = JSON.parse(text) as HealthInsight;
      return insights;
    } catch (error) {
      console.error("Failed to parse Gemini response:", error);
      console.log("Raw response:", text);
      throw new Error("Invalid response format from AI service");
    }
  } catch (error) {
    console.error("Error generating health insights:", error);
    throw error;
  }
}

// Chat with AI about health questions
export async function chatWithHealthAI(
  history: ChatMessage[],
  userQuestion: string,
  patientContext?: {
    age?: number;
    gender?: string;
    testResults?: TestResult[];
    knownConditions?: string[];
  }
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro", // the newest Gemini model which was released May 13, 2024. do not change this unless explicitly requested by the user
      safetySettings,
    });

    // Format any patient context if available
    let contextStr = "";
    if (patientContext) {
      contextStr = "Patient Context:\n";
      if (patientContext.age) contextStr += `Age: ${patientContext.age}\n`;
      if (patientContext.gender) contextStr += `Gender: ${patientContext.gender}\n`;
      if (patientContext.knownConditions?.length)
        contextStr += `Known conditions: ${patientContext.knownConditions.join(", ")}\n`;
      
      if (patientContext.testResults?.length) {
        contextStr += "Recent test results:\n";
        patientContext.testResults.forEach((result) => {
          contextStr += `- ${result.name}: ${result.value} ${result.unit} (Reference: ${result.referenceRange})\n`;
        });
      }
    }

    // Convert history to the format expected by Gemini API
    const chatHistory = history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    // Add system prompt at the beginning for consistent behavior
    const systemPrompt = {
      role: "model" as const,
      parts: [
        {
          text: `${LAB_ASSISTANT_PROMPT}\n\nYou are a helpful medical assistant providing guidance on health-related questions. You should:\n1. Provide accurate, evidence-based information\n2. Always clarify that you're not replacing professional medical advice\n3. Be empathetic and clear in your explanations\n4. Focus on medically validated recommendations\n5. If you don't know something, admit that rather than making up information\n\n${contextStr}\n\nNow, please respond to the patient's questions.`,
        },
      ],
    };

    // Add the current question to the chat history
    const currentQuestion = {
      role: "user" as const,
      parts: [{ text: userQuestion }],
    };

    // Combine system prompt, chat history, and current question
    const fullHistory = [systemPrompt, ...chatHistory, currentQuestion];

    // Generate the response
    const result = await model.generateContent({
      contents: fullHistory,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
      },
    });

    return result.response.text();
  } catch (error) {
    console.error("Error in health AI chat:", error);
    throw error;
  }
}

// Function to generate personalized diet plan based on health insights
export async function generateDietPlan(
  testResults: TestResult[],
  preferences?: {
    dietaryRestrictions?: string[];
    allergies?: string[];
    favoriteIngredients?: string[];
    cuisinePreferences?: string[];
  }
): Promise<{
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
}> {
  try {
    // Get the model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro", // the newest Gemini model which was released May 13, 2024. do not change this unless explicitly requested by the user
      safetySettings,
    });

    // Format test results
    const formattedResults = testResults
      .map(
        (result) =>
          `${result.name}: ${result.value} ${result.unit} (Reference Range: ${result.referenceRange})`
      )
      .join("\n");

    // Format preferences if available
    let preferencesStr = "";
    if (preferences) {
      if (preferences.dietaryRestrictions?.length)
        preferencesStr += `Dietary Restrictions: ${preferences.dietaryRestrictions.join(", ")}\n`;
      if (preferences.allergies?.length)
        preferencesStr += `Allergies: ${preferences.allergies.join(", ")}\n`;
      if (preferences.favoriteIngredients?.length)
        preferencesStr += `Preferred Ingredients: ${preferences.favoriteIngredients.join(", ")}\n`;
      if (preferences.cuisinePreferences?.length)
        preferencesStr += `Preferred Cuisines: ${preferences.cuisinePreferences.join(", ")}\n`;
    }

    // Create prompt for diet plan
    const prompt = `
${LAB_ASSISTANT_PROMPT}

As a nutritional expert, create a personalized 3-day diet plan based on the following lab test results:

${formattedResults}

${preferencesStr ? `Patient preferences:\n${preferencesStr}` : ""}

Please provide the diet plan in the following JSON format:
{
  "summary": "A brief summary of the nutritional approach and its benefits for this specific health profile",
  "dailyPlan": [
    {
      "day": "Day 1",
      "meals": [
        {
          "name": "Meal name",
          "description": "Brief description of the meal",
          "ingredients": ["List of ingredients"],
          "nutritionalBenefits": "How this meal addresses specific health concerns from the test results"
        }
      ]
    }
  ],
  "recommendations": ["General nutritional recommendations"]
}

Important: Make sure each meal directly addresses health concerns identified in the test results. Provide scientific reasoning for your recommendations.
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
    });

    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error("Failed to parse diet plan response:", error);
      console.log("Raw response:", text);
      throw new Error("Invalid diet plan format from AI service");
    }
  } catch (error) {
    console.error("Error generating diet plan:", error);
    throw error;
  }
}