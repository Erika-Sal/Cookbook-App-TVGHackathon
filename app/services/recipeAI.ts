// React Native version using REST API directly
// Add GEMINI_API_KEY to your .env file
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyCb3zso3zQSWQ0MpC0ZKgFbVFUhRZ7Tkh0';

export const askRecipeQuestion = async (
  question: string,
  recipeTitle: string,
  ingredients: string[],
  instructions: string[],
  story: string,
  culturalContext: string
): Promise<string> => {
  try {
    const prompt = `You are a helpful cooking assistant with knowledge about this family recipe:

Recipe: ${recipeTitle}
Ingredients: ${ingredients.join('\n')}
Instructions: ${instructions.join('\n')}
Story: ${story}
Cultural Context: ${culturalContext}

Answer the following cooking question about this recipe in a warm, knowledgeable way. If suggesting substitutions, explain how it might affect the dish. Keep responses concise (2-3 sentences).

Question: ${question}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to get response');
    }
    
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated";
  } catch (error) {
    console.error('AI Error:', error);
    return "I'm having trouble answering right now. Please try again.";
  }
};