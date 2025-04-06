'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaKey, FaLock, FaRobot } from 'react-icons/fa';
import { LLMProvider } from '../types';
import { 
  loadSettings, 
  saveApiKey, 
  setPreferredProvider 
} from '../utils/settings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  const [preferredProvider, setPreferredLLM] = useState<LLMProvider>('gemini');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  
  // Load saved settings
  useEffect(() => {
    if (isOpen) {
      const settings = loadSettings();
      setGeminiKey(settings.apiKeys.gemini || '');
      setOpenaiKey(settings.apiKeys.openai || '');
      setClaudeKey(settings.apiKeys.claude || '');
      setPreferredLLM(settings.preferredProvider);
    }
  }, [isOpen]);

  const handleSave = () => {
    saveApiKey('gemini', geminiKey);
    saveApiKey('openai', openaiKey);
    saveApiKey('claude', claudeKey);
    setPreferredProvider(preferredProvider);
    
    // Show success message
    setSaveStatus('Settings saved successfully!');
    setTimeout(() => {
      setSaveStatus(null);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="card w-full max-w-md mx-4 p-6 relative overflow-hidden"
          >
            {/* Decorative element */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-highlight to-highlight/50" />

            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <FaTimes size={20} />
            </motion.button>
            
            <h2 className="text-2xl font-semibold mb-6 highlight flex items-center gap-2">
              <FaRobot className="text-highlight" /> Settings
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <FaKey className="text-highlight" /> API Keys
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-text-secondary mb-1 flex items-center gap-1">
                      <FaLock size={12} /> Google Gemini API Key
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="password"
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="Enter Gemini API key"
                      className="w-full bg-background border border-gray-700 rounded p-2 text-white focus:border-highlight focus:ring-1 focus:ring-highlight/30 transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-text-secondary mb-1 flex items-center gap-1">
                      <FaLock size={12} /> OpenAI API Key
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="password"
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder="Enter OpenAI API key"
                      className="w-full bg-background border border-gray-700 rounded p-2 text-white focus:border-highlight focus:ring-1 focus:ring-highlight/30 transition-all duration-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-text-secondary mb-1 flex items-center gap-1">
                      <FaLock size={12} /> Anthropic Claude API Key
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="password"
                      value={claudeKey}
                      onChange={(e) => setClaudeKey(e.target.value)}
                      placeholder="Enter Claude API key"
                      className="w-full bg-background border border-gray-700 rounded p-2 text-white focus:border-highlight focus:ring-1 focus:ring-highlight/30 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Preferred AI Provider</h3>
                <div className="grid grid-cols-3 gap-2">
                  <motion.button
                    whileHover={preferredProvider !== 'gemini' ? { scale: 1.05 } : {}}
                    whileTap={preferredProvider !== 'gemini' ? { scale: 0.95 } : {}}
                    className={`p-2 rounded ${
                      preferredProvider === 'gemini' 
                        ? 'btn-primary glow-btn' 
                        : 'bg-gray-800 text-white'
                    }`}
                    onClick={() => setPreferredLLM('gemini')}
                  >
                    Gemini
                  </motion.button>
                  <motion.button
                    whileHover={preferredProvider !== 'openai' ? { scale: 1.05 } : {}}
                    whileTap={preferredProvider !== 'openai' ? { scale: 0.95 } : {}}
                    className={`p-2 rounded ${
                      preferredProvider === 'openai' 
                        ? 'btn-primary glow-btn' 
                        : 'bg-gray-800 text-white'
                    }`}
                    onClick={() => setPreferredLLM('openai')}
                  >
                    OpenAI
                  </motion.button>
                  <motion.button
                    whileHover={preferredProvider !== 'claude' ? { scale: 1.05 } : {}}
                    whileTap={preferredProvider !== 'claude' ? { scale: 0.95 } : {}}
                    className={`p-2 rounded ${
                      preferredProvider === 'claude' 
                        ? 'btn-primary glow-btn' 
                        : 'bg-gray-800 text-white'
                    }`}
                    onClick={() => setPreferredLLM('claude')}
                  >
                    Claude
                  </motion.button>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-4 py-2 rounded bg-gray-800 text-white"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="px-4 py-2 rounded btn-primary glow-btn"
              >
                Save Settings
              </motion.button>
            </div>

            {/* Success message */}
            <AnimatePresence>
              {saveStatus && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-0 left-0 right-0 p-3 bg-green-900/70 text-green-200 text-center"
                >
                  {saveStatus}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}