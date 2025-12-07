
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, BoostResult, BoostSuggestions } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzePasswordRisk = async (password: string): Promise<AIAnalysisResult> => {
  if (!password) {
    throw new Error("Password is required for analysis");
  }

  const prompt = `
    Analyze the following password for security strength, complexity, and semantic patterns.
    Password to analyze: "${password}"
    
    Perform a deep cyber-security risk assessment.
    1. Estimate the time to crack using brute force (assume standard GPU rig).
    2. Identify semantic weaknesses (e.g., dictionary words, common substitutions, keyboard patterns, dates).
    3. Identify strengths (entropy, mixing).
    4. Provide a "breach probability" estimation based on commonality.
    5. List specific "Attack Vectors" or Hacking Methods that would be most effective against this password (e.g., "Dictionary Attack", "Rainbow Table", "Social Engineering", "Keyboard Walk", "Brute Force", "Mask Attack").
    
    Return the result strictly as JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.NUMBER,
              description: "Security score from 0 to 100",
            },
            crackTime: {
              type: Type.STRING,
              description: "Estimated time to crack (e.g., '2 minutes', '300 centuries')",
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of specific security flaws",
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of good security practices found",
            },
            aiInsight: {
              type: Type.STRING,
              description: "A specialized cyber-security expert comment on the password pattern.",
            },
            breachProbability: {
              type: Type.STRING,
              description: "Risk level: Low, Medium, High, or Critical",
            },
            similarPatterns: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Examples of similar patterns hackers look for (e.g. 'Dates', 'Leet speak')",
            },
            attackVectors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of specific hacking methods effective against this password",
            }
          },
          required: ["score", "crackTime", "weaknesses", "strengths", "aiInsight", "breachProbability", "attackVectors"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
       throw new Error("No response from AI");
    }

    return JSON.parse(resultText) as AIAnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Fallback for demo/error purposes if API fails
    return {
      score: 10,
      crackTime: "Unknown (API Error)",
      weaknesses: ["Unable to perform deep scan"],
      strengths: [],
      aiInsight: "System offline. Unable to verify pattern integrity.",
      breachProbability: "Unknown",
      similarPatterns: [],
      attackVectors: ["Connection Failure"]
    };
  }
};

export const boostPassword = async (password: string): Promise<BoostResult> => {
    const prompt = `
        Act as a cryptographic security expert. 
        Target Password: "${password}"
        
        Objective: Strengthen this password significantly while preserving its mnemonic quality so the user can still remember it.
        
        Directives:
        1. KEEP THE CORE: The user must still recognize the original word or idea. (e.g. "dragon" -> "Dr4g0n#Fly!99", NOT "x7#m9aZb").
        2. INCREASE ENTROPY: Inject special characters, numbers, and casing at strategic points.
        3. AVOID PREDICTABILITY: Do not simply append "123" or "!" at the end. Mix it up.
        4. MINIMUM STRENGTH: The result must be practically uncrackable by standard brute force.
        5. FALLBACK: If the input is extremely weak (e.g. "123456"), provide a strong but readable alternative.
        
        Return strictly JSON with format: { "boostedPassword": "...", "explanation": "..." }
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        boostedPassword: { type: Type.STRING, description: "The new stronger password" },
                        explanation: { type: Type.STRING, description: "Short explanation of what was changed to improve strength (max 15 words)" }
                    },
                    required: ["boostedPassword", "explanation"]
                }
            }
        });
        
        const resultText = response.text;
        if (!resultText) throw new Error("No response");
        return JSON.parse(resultText) as BoostResult;

    } catch (error) {
        console.error("Boost failed:", error);
        return {
            boostedPassword: password + "!!SECURE" + Math.floor(Math.random() * 100),
            explanation: "Fallback enhancement applied."
        };
    }
};

export const getBoostSuggestions = async (password: string): Promise<BoostSuggestions> => {
  const prompt = `
    Analyze this password: "${password}".
    Provide a set of "building blocks" that a user could manually add to this password to strengthen it.
    
    1. Suggest 4-5 relevant special characters that fit well (e.g. if password is 'money', suggest '$').
    2. Suggest 3-4 short numeric or text suffixes/prefixes that increase entropy (e.g. year, random number, or related word).
    3. Suggest 3-4 simple "leet speak" character substitutions relevant to the characters IN the password (e.g. if 'a' exists, suggest replacing with '@').
    
    Return JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedSymbols: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of symbols like !, @, #, $" },
            suggestedSuffixes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of strings to append like 99, 2024, #secure" },
            leetspeak: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  replacement: { type: Type.STRING }
                }
              },
              description: "List of substitution pairs" 
            },
          }
        }
      }
    });
    
    const resultText = response.text;
    if (!resultText) throw new Error("No response");
    return JSON.parse(resultText) as BoostSuggestions;

  } catch (error) {
    return {
      suggestedSymbols: ['!', '#', '@', '$', '%', '&'],
      suggestedSuffixes: ['2024', '99', '!X', 'Secure'],
      leetspeak: [{ original: 'a', replacement: '@' }, { original: 'e', replacement: '3' }]
    };
  }
};
