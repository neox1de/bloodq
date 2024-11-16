import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

interface LLMSettings {
  model: string;
  apiKey: string;
}

export async function generateInsights(image: File, description: string = '') {
  // Get settings from localStorage
  const settingsStr = localStorage.getItem('llm_settings')
  const settings: LLMSettings | null = settingsStr ? JSON.parse(settingsStr) : null
  
  if (settings?.apiKey) { // if user have set a api key, use that
    // Use user's chosen model
    switch (settings.model) {
      case 'gemini':
        return await useGemini(image, description, settings.apiKey)
      case 'gpt-4o':
      case 'gpt-4-turbo':
        return await useOpenAI(image, description, settings.apiKey, settings.model)
      default:
        throw new Error('Unsupported model selected')
    }
  } else {  // Fallback to Gemini with env API key
    const geminiKey = process.env.NEXT_PUBLIC_GEMINI_KEY
    if (!geminiKey) {
      throw new Error('No API key available')
    }
    return await useGemini(image, description, geminiKey)
  }
}

async function useGemini(image: File, description: string, apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


  const imageData = await convert_image_format(image);

  const prompt = `Analyze this blood test result image. ${description ? 'Additional context: ' + description : ''}
  Provide a brief analysis:
  1. Are the results healthy or not?
  2. If not healthy, what potential conditions are indicated?
  3. What immediate actions should be taken?
  Keep the response concise and focused on key concerns only.
  if the image did not contain a blood test result, respond with "No blood test result found."`;

  try {
    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    if (error instanceof Error && error.message.includes('API key not valid. Please pass a valid API key.')) {
      throw new Error('API key not valid. Please pass a valid API key.');
    }
    throw new Error('Failed to analyze blood test results');
  }
}

async function useOpenAI(image: File, description: string, apiKey: string, model: string) {
  // Convert image to base64
  const base64Image = await fileToBase64(image);

  const openai = new OpenAI({
    apiKey: apiKey
  });

  const completion = await openai.chat.completions.create({
    model: model,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this blood test result image. ${description ? 'Additional context: ' + description : ''}
            Provide a brief analysis:
            1. Are the results healthy or not?
            2. If not healthy, what potential conditions are indicated?
            3. What immediate actions should be taken?
            Keep the response concise and focused on key concerns only.
            if the image did not contain a blood test result, respond with "No blood test result found."`
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${base64Image}` // https://www.datacamp.com/tutorial/gpt4o-api-openai-tutorial
            }
          }
        ]
      }
    ]
  });

  if (!completion.choices[0].message) {
    throw new Error('Failed to analyze blood test results');
  }

  return completion.choices[0].message.content;
}



async function convert_image_format(file: File) {
  const buffer = await file.arrayBuffer();
  return {
    inlineData: {
      data: Buffer.from(buffer).toString('base64'),
      mimeType: file.type,
    },
  };
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
} 