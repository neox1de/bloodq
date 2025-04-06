import { AnalysisRequest, LLMProvider } from '@/app/types';
import { NextRequest, NextResponse } from 'next/server';

// Prompt template for blood test analysis
const ANALYSIS_PROMPT = `
You are a medical expert analyzing a blood test result. 
Examine the image of the blood test results and provide a detailed analysis including:

1. A summary of the test results
2. Identification of any abnormal values and their significance
3. Potential health implications based on these results
4. General recommendations (NOT medical advice)

Present this information in a clear, organized format.
`;

const getApiEndpoint = (provider: LLMProvider) => {
  switch (provider) {
    case 'gemini':
      return 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    case 'openai':
      return 'https://api.openai.com/v1/chat/completions';
    case 'claude':
      return 'https://api.anthropic.com/v1/messages';
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
};

const prepareGeminiRequest = (imageBase64: string, contextText?: string, apiKey?: string) => {
  const apiKeyToUse = apiKey || process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKeyToUse) {
    throw new Error('No Gemini API key provided');
  }

  // Extract base64 data without the prefix (e.g., data:image/jpeg;base64,)
  const base64Data = imageBase64.split(',')[1];
  
  const prompt = contextText 
    ? `${ANALYSIS_PROMPT}\n\nAdditional context provided by user: ${contextText}`
    : ANALYSIS_PROMPT;

  return {
    url: `${getApiEndpoint('gemini')}?key=${apiKeyToUse}`,
    options: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        }
      })
    }
  };
};

const prepareOpenAIRequest = (imageBase64: string, contextText?: string, apiKey?: string) => {
  if (!apiKey) {
    throw new Error('No OpenAI API key provided');
  }

  const prompt = contextText 
    ? `${ANALYSIS_PROMPT}\n\nAdditional context provided by user: ${contextText}`
    : ANALYSIS_PROMPT;

  return {
    url: getApiEndpoint('openai'),
    options: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        max_tokens: 2048,
        temperature: 0.1,
      })
    }
  };
};

const prepareClaudeRequest = (imageBase64: string, contextText?: string, apiKey?: string) => {
  if (!apiKey) {
    throw new Error('No Claude API key provided');
  }

  // Extract base64 data without the prefix
  const base64Data = imageBase64.split(',')[1];
  const mimeType = imageBase64.split(';')[0].split(':')[1];

  const prompt = contextText 
    ? `${ANALYSIS_PROMPT}\n\nAdditional context provided by user: ${contextText}`
    : ANALYSIS_PROMPT;

  return {
    url: getApiEndpoint('claude'),
    options: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 2048,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ]
      })
    }
  };
};

async function analyzeBloodTest(request: AnalysisRequest, userApiKey?: string) {
  try {
    const { imageBase64, contextText, provider } = request;

    if (!imageBase64) {
      throw new Error('No image provided');
    }

    let fetchConfig;
    
    switch (provider) {
      case 'gemini':
        fetchConfig = prepareGeminiRequest(imageBase64, contextText, userApiKey);
        break;
      case 'openai':
        fetchConfig = prepareOpenAIRequest(imageBase64, contextText, userApiKey);
        break;
      case 'claude':
        fetchConfig = prepareClaudeRequest(imageBase64, contextText, userApiKey);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }

    const response = await fetch(fetchConfig.url, fetchConfig.options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    let resultText = '';

    // Extract the result based on the provider's response format
    switch (provider) {
      case 'gemini':
        resultText = data.candidates[0].content.parts[0].text;
        break;
      case 'openai':
        resultText = data.choices[0].message.content;
        break;
      case 'claude':
        resultText = data.content[0].text;
        break;
    }

    return {
      success: true,
      result: {
        text: resultText,
        provider,
        timestamp: Date.now()
      }
    };
  } catch (error) {
    console.error('Analysis error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json() as AnalysisRequest;
    const userApiKey = requestData.provider === 'gemini' 
      ? request.headers.get('x-gemini-key') 
      : requestData.provider === 'openai'
        ? request.headers.get('x-openai-key')
        : request.headers.get('x-claude-key');
    
    const result = await analyzeBloodTest(requestData, userApiKey || undefined);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}