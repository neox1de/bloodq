'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCopy, FaCheckCircle, FaFileDownload, FaRobot, FaArrowLeft } from 'react-icons/fa';
import { AnalysisResult } from '../types';
import ReactMarkdown from 'react-markdown';

interface ResultDisplayProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  onBack: () => void;
}

export default function ResultDisplay({ result, isLoading, onBack }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (result?.text) {
      navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    
    const blob = new Blob([
      `Blood Test Analysis Results\n` +
      `Provider: ${getProviderLabel(result.provider)}\n` +
      `Date: ${formatTimestamp(result.timestamp)}\n\n` +
      result.text
    ], { type: 'text/plain' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bloodq-analysis-${new Date(result.timestamp).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getProviderLabel = (provider: string) => {
    switch(provider) {
      case 'gemini': return 'Google Gemini';
      case 'openai': return 'OpenAI ChatGPT';
      case 'claude': return 'Anthropic Claude';
      default: return provider;
    }
  };

  const getProviderIcon = (provider: string) => {
    return <FaRobot className="text-highlight" />;
  };

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 w-full min-h-[200px] flex items-center justify-center"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-highlight border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-secondary">Analyzing your blood test results...</p>
          <p className="text-xs text-text-secondary">This may take a moment</p>
        </div>
      </motion.div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card p-6 w-full"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getProviderIcon(result.provider)}
          <div>
            <h3 className="text-xl font-semibold highlight">Analysis Results</h3>
            <p className="text-sm text-text-secondary">
              Analyzed by {getProviderLabel(result.provider)} on {formatTimestamp(result.timestamp)}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors settings-btn"
            title="Back to image upload"
          >
            <FaArrowLeft className="text-highlight" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={downloadResult}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
            title="Download as text file"
          >
            <FaFileDownload className="text-gray-400" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={copyToClipboard}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <FaCheckCircle className="text-highlight" />
            ) : (
              <FaCopy className="text-gray-400" />
            )}
          </motion.button>
        </div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-[500px] border border-gray-800"
      >
        <div className="whitespace-pre-wrap font-mono text-sm prose prose-invert prose-headings:text-highlight prose-strong:text-white prose-a:text-highlight">
          <ReactMarkdown>
            {result.text}
          </ReactMarkdown>
        </div>
      </motion.div>
      
      <div className="mt-4 text-xs text-text-secondary italic">
        Note: This analysis is for informational purposes only and should not replace professional medical advice.
      </div>
    </motion.div>
  );
}