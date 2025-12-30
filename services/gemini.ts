
import { GoogleGenAI, Type } from "@google/genai";

// Standardizing the Gemini client initialization
export const getGeminiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY is not configured.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export async function generateAIIImage(prompt: string, aspectRatio: string = "1:1") {
  const ai = getGeminiClient();
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: prompt }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image data found in response");
}

export async function validateAgentAction(agentRole: string, action: string, context: string) {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `As an AI ${agentRole}, validate this action: "${action}" in the context of: "${context}". Is it compliant with brand safety and performance goals? Respond ONLY with a JSON object: { "compliant": boolean, "reason": "string", "suggestedCorrection": "string" }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          compliant: { type: Type.BOOLEAN },
          reason: { type: Type.STRING },
          suggestedCorrection: { type: Type.STRING }
        },
        required: ["compliant", "reason", "suggestedCorrection"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function generateCampaignRetrospective(campaignData: any) {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze this campaign data and provide a retrospective report: ${JSON.stringify(campaignData)}. Include lessons learned and a self-correction plan.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          sentimentScore: { type: Type.NUMBER },
          engagementQuality: { type: Type.STRING },
          lessonsLearned: { type: Type.ARRAY, items: { type: Type.STRING } },
          selfCorrectionPlan: { type: Type.STRING }
        },
        required: ["sentimentScore", "engagementQuality", "lessonsLearned", "selfCorrectionPlan"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
}

export async function startVideoGeneration(prompt: string, aspectRatio: "16:9" | "9:16" = "16:9") {
  const ai = getGeminiClient();
  
  const operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio
    }
  });

  return operation;
}

export async function pollVideoOperation(operationId: any) {
    const ai = getGeminiClient();
    return await ai.operations.getVideosOperation({ operation: operationId });
}

export async function fetchVideoData(downloadLink: string) {
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}
