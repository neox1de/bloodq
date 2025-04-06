# Bloodq - Blood Test Analyzer
[![Netlify Status](https://api.netlify.com/api/v1/badges/260015dc-474a-4289-b4af-a1e042fa0d45/deploy-status)](https://app.netlify.com/sites/bloodq/deploys)

Bloodq is a web application that analyzes blood test results using AI. It leverages multiple AI providers (Google Gemini, OpenAI, and Anthropic Claude) to provide comprehensive analysis of uploaded blood test images.

## Features

- **Image Upload**: Upload blood test images for AI analysis
- **Multi-Provider Support**: Choose between Google Gemini, OpenAI, and Anthropic Claude
- **API Key Management**: Securely store your API keys in browser local storage
- **Customizable**: Add contextual information to improve analysis accuracy
- **Modern UI**: Responsive design with smooth animations and clean interface
- **Dark Theme**: Sleek dark design with lime green accent color

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file in the project root with your API keys:
   ```
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

### Development

Run the development server:
```
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```
npm run build
npm start
```

## Security Considerations

- API keys are stored only in the browser's local storage, not on any server
- Bloodq processes blood test images on the client side before sending them to AI providers
- Always use HTTPS in production to secure data transmission

## Disclaimer

Bloodq provides blood test analysis for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical advice.
