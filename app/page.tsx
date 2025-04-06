'use client';

import { useState, useEffect } from 'react';
import { FaCog, FaLightbulb, FaQuestionCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import FileUploader from './components/FileUploader';
import ResultDisplay from './components/ResultDisplay';
import SettingsModal from './components/SettingsModal';
import { AnalysisResult, LLMProvider } from './types';
import { 
  getPreferredProvider, 
  getApiKey, 
  hasAnyApiKey,
  hasProviderApiKey,
  loadSettings,
  getRemainingImageCount,
  trackImageProcessed,
  getResetTimeRemaining
} from './utils/settings';

export default function Home() {
  const [imageBase64, setImageBase64] = useState<string>('');
  const [contextText, setContextText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [provider, setProvider] = useState<LLMProvider>('gemini');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [remainingImages, setRemainingImages] = useState<number>(2);
  const [resetTime, setResetTime] = useState<number>(0);

  // Load settings on initial render
  useEffect(() => {
    const settings = loadSettings();
    setProvider(settings.preferredProvider);
    setHasApiKey(hasAnyApiKey());
    updateRemainingImages();
  }, []);

  // Update remaining image count
  const updateRemainingImages = () => {
    setRemainingImages(getRemainingImageCount(provider));
    setResetTime(getResetTimeRemaining());
  };

  // Format time remaining until reset
  const formatTimeRemaining = (milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (60 * 60 * 1000));
    const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${minutes}m`;
  };

  // Update available providers when settings modal is closed
  const handleSettingsClose = () => {
    setShowSettings(false);
    setProvider(getPreferredProvider());
    setHasApiKey(hasAnyApiKey());
  };

  const handleAnalyze = async () => {
    if (!imageBase64) {
      setError('Please upload an image first');
      return;
    }

    // Check if user has reached the limit (skip check if using own API key)
    const trackResult = trackImageProcessed(provider);
    if (!trackResult.success) {
      setError(`You've reached the limit of 2 images in 24 hours. Try again in ${formatTimeRemaining(resetTime)}.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setShowResults(true);
    
    try {
      const userApiKey = getApiKey(provider);
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(provider === 'gemini' && userApiKey && { 'x-gemini-key': userApiKey }),
          ...(provider === 'openai' && userApiKey && { 'x-openai-key': userApiKey }),
          ...(provider === 'claude' && userApiKey && { 'x-claude-key': userApiKey }),
        },
        body: JSON.stringify({
          imageBase64,
          contextText: contextText.trim() || undefined,
          provider
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze blood test');
      }
      
      setResult(data.result);
      updateRemainingImages();
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToUpload = () => {
    setShowResults(false);
  };

  const getProviderLabel = (providerName: LLMProvider) => {
    switch(providerName) {
      case 'gemini': return 'Google Gemini';
      case 'openai': return 'OpenAI ChatGPT';
      case 'claude': return 'Anthropic Claude';
    }
  };

  // Check if limit applies for current provider
  const isLimitApplied = (): boolean => {
    return !hasProviderApiKey(provider);
  };

  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8 bg-gradient-to-b from-background to-card-bg"
    >
      <header className="w-full max-w-4xl flex justify-between items-center mb-8">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold highlight glow inline-block">
            Bloodq
          </h1>
          <p className="text-text-secondary">
            AI-powered blood test analyzer
          </p>
        </motion.div>
        
        <motion.button 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => setShowSettings(true)}
          className="p-3 rounded-full settings-btn"
          aria-label="Settings"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FaCog className="text-xl" />
        </motion.button>
      </header>
      
      <div className="w-full max-w-4xl space-y-8">
        <motion.section 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h2 className="text-2xl font-semibold mb-4">
            {showResults ? 'Analysis Results' : 'Upload Blood Test Image'}
          </h2>

          {!showResults ? (
            <>
              <FileUploader onImageSelect={setImageBase64} />
              
              <div className="mt-6">
                <label htmlFor="context" className="block mb-2 text-sm font-medium">
                  Additional Context (optional)
                </label>
                <textarea
                  id="context"
                  rows={3}
                  value={contextText}
                  onChange={(e) => setContextText(e.target.value)}
                  placeholder="Add any additional information about your blood test that might be helpful..."
                  className="w-full bg-background border border-gray-700 rounded p-3 text-white focus:ring-2 focus:ring-highlight/50 focus:border-highlight transition-all duration-200"
                ></textarea>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex flex-col items-start space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-text-secondary">Using:</span>
                    <span className="px-3 py-1 rounded-full bg-gray-800 text-sm">
                      {getProviderLabel(provider)}
                    </span>
                  </div>
                  {isLimitApplied() && (
                    <div className="text-sm text-text-secondary">
                      Remaining: <span className={`font-medium ${remainingImages === 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {remainingImages}/2
                      </span> images today
                    </div>
                  )}
                  {!isLimitApplied() && (
                    <div className="text-sm text-green-400">
                      No limit (using your API key)
                    </div>
                  )}
                </div>
                
                <motion.button
                  onClick={handleAnalyze}
                  disabled={isLoading || !imageBase64 || (isLimitApplied() && remainingImages === 0)}
                  className={`px-6 py-3 rounded-md ${
                    isLoading || !imageBase64 || (isLimitApplied() && remainingImages === 0)
                      ? 'bg-gray-700 cursor-not-allowed'
                      : 'btn-primary glow-btn'
                  } w-full sm:w-auto`}
                  whileHover={imageBase64 && !isLoading && (!isLimitApplied() || remainingImages > 0) ? { scale: 1.03 } : {}}
                  whileTap={imageBase64 && !isLoading && (!isLimitApplied() || remainingImages > 0) ? { scale: 0.97 } : {}}
                >
                  {isLoading ? 'Analyzing...' : 'Analyze Blood Test'}
                </motion.button>
              </div>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-red-900/50 border border-red-800 rounded-md text-red-200"
                >
                  {error}
                </motion.div>
              )}
              
              {!hasApiKey && provider !== 'gemini' && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-yellow-900/50 border border-yellow-800 rounded-md text-yellow-200 flex items-start gap-2"
                >
                  <FaLightbulb className="text-yellow-200 text-lg flex-shrink-0 mt-0.5" />
                  <span>
                    You need to add your {getProviderLabel(provider)} API key in settings before using this provider.
                  </span>
                </motion.div>
              )}
              
              {isLimitApplied() && remainingImages === 0 && !error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-yellow-900/50 border border-yellow-800 rounded-md text-yellow-200 flex items-start gap-2"
                >
                  <FaLightbulb className="text-yellow-200 text-lg flex-shrink-0 mt-0.5" />
                  <span>
                    You've reached the limit of 2 images in 24 hours. Try again in {formatTimeRemaining(resetTime)} or add your own API key in settings.
                  </span>
                </motion.div>
              )}
              
              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="flex items-start gap-2 text-text-secondary text-sm">
                  <FaQuestionCircle className="text-lg flex-shrink-0 mt-0.5 highlight" />
                  <p>
                    Upload a clear photo of your blood test results for AI analysis. For best results, ensure all text is legible and include all values in the image.
                    <br />
                    <span className="mt-1 block text-xs opacity-80">
                      {isLimitApplied() 
                        ? "Limited to 2 image analyses per browser in a 24-hour period when using the default API key. Add your own API key in settings to remove this limit." 
                        : "Using your own API key - no limits applied."}
                    </span>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <ResultDisplay 
              result={result} 
              isLoading={isLoading} 
              onBack={handleBackToUpload} 
            />
          )}
        </motion.section>
      </div>

      <footer className="mt-auto pt-8 w-full max-w-4xl text-center text-sm text-text-secondary">
        <p className="mt-1">Not a substitute for professional medical advice</p>
      </footer>
      
      <SettingsModal isOpen={showSettings} onClose={handleSettingsClose} />
    </motion.main>
  );
}
