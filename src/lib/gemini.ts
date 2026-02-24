import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const parseHistorique = async (text: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this historical sports betting data (pasted from Google Lens). Extract the overall patterns.
    Data: ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          preview: { type: Type.STRING, description: "A short 3-4 word summary of the data" },
          risk: { type: Type.STRING, description: "Low, Medium, or High" },
          stability: { type: Type.NUMBER, description: "0 to 100 score of pattern stability" },
          trend: { type: Type.STRING, description: "Global pattern trend description" },
          dominant: { type: Type.STRING, description: "Dominant outcome: 1, X, or 2" },
          goals: { type: Type.STRING, description: "Goal average trend (e.g., Over 2.5 frequent)" }
        },
        required: ["preview", "risk", "stability", "trend", "dominant", "goals"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const runPredictionAnalysis = async (historiques: string[], matchesText: string) => {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `You are a highly advanced sports betting analysis engine. 
    You must base your predictions STRICTLY on the patterns found in the provided historical data. 
    Do not use random generation. Use probability weighting logic based on frequency, goal averages, and stability from the history.
    
    Historical Data:
    ${historiques.join('\n---\n')}
    
    Matches to analyze:
    ${matchesText}
    
    Generate predictions for each match across all requested markets. Also generate 10 multiples (3 matches each, 1X2 only) and a list of high odds opportunities (odds 10-100).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matches: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                matchName: { type: Type.STRING },
                predictions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      market: { type: Type.STRING, description: "e.g., 1X2, Mi-Temps 1X2, Over/Under 2.5, etc." },
                      value: { type: Type.STRING },
                      confidence: { type: Type.NUMBER },
                      risk: { type: Type.STRING, description: "Low, Medium, High" },
                      logic: { type: Type.STRING }
                    },
                    required: ["market", "value", "confidence", "risk", "logic"]
                  }
                }
              },
              required: ["matchName", "predictions"]
            }
          },
          multiples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                selections: { type: Type.ARRAY, items: { type: Type.STRING } },
                totalOdds: { type: Type.NUMBER },
                riskLevel: { type: Type.STRING },
                stabilityIndex: { type: Type.NUMBER }
              },
              required: ["selections", "totalOdds", "riskLevel", "stabilityIndex"]
            }
          },
          highOdds: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                market: { type: Type.STRING },
                estimatedOdd: { type: Type.NUMBER },
                riskExplanation: { type: Type.STRING },
                status: { type: Type.STRING, description: "Green, Yellow, or Red" }
              },
              required: ["market", "estimatedOdd", "riskExplanation", "status"]
            }
          }
        },
        required: ["matches", "multiples", "highOdds"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
};
