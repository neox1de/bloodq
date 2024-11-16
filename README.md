# Bloodq 🩺

Bloodq is an AI-powered application that quickly analyzes blood test results into clear, actionable insights. Built with Next.js and powered by advanced large language models (LLMs), it helps users understand their blood test results in plain language.


## 🌟 Features

- **Instant Analysis**: Upload your blood test results and get immediate insights
- **Multiple AI Models**: Support for both Gemini and GPT-4o/GPT-4 Turbo
- **User-Friendly Interface**: Clean, intuitive design for easy navigation
- **Customizable Settings**: Use your own API keys for preferred AI models
- **Privacy-Focused**: All processing happens in real-time with no data storage
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js
- npm or yarn
- API key for either Google's Gemini or OpenAI

### Installation

1. Clone the repository:
```bash
git clone https://github.com/neox1de/bloodq.git
cd bloodq
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Google's Gemini Model is the default model of the app, if you want users to have access without having their own api key, make sure to set the Google Gemini API key.Create a `.env.local` file in the root directory and put your gemini api key there:
```env
NEXT_PUBLIC_GEMINI_KEY=your_gemini_api_key_here
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Built With

- [Next.js ](https://nextjs.org/) - React Framework
- [React ](https://reactjs.org/) - UI Library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Google Generative AI](https://ai.google.dev/) - Gemini API
- [OpenAI](https://openai.com/) - GPT API Support 

## 📖 Usage

1. **Upload Results**: Click the upload button to select your blood test result image
2. **Add Context**: (Optional) Provide any additional context about the test
3. **Generate Insights**: Click analyze to get AI-powered insights
4. **Customize Settings**: Use the settings button to:
   - Switch between AI models (Gemini/GPT)
   - Add your own API keys
   - Adjust analysis preferences (not implemented yet)

## 🔐 Privacy & Security

- No blood test results or personal data are stored by the app, however the AI Model provider may save some information.
- API keys are stored locally in the browser's localStorage
- All processing happens in real-time


## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js team](https://nextjs.org/) for the amazing framework
- [Google](https://ai.google.dev/) for Gemini API
- [OpenAI](https://openai.com/) for GPT API
- All contributors and users of this project

## 📞 Support

Having issues? Let us know:
- Create an issue in this repository
- Contact Email: neox1de@proton.me
- X (formerly known as twitter): [@neox1de](https://x.com/neox1de)
