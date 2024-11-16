import { useState } from 'react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [selectedModel, setSelectedModel] = useState('gpt-4')
  const [apiKey, setApiKey] = useState('')

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('llm_settings', JSON.stringify({
      model: selectedModel,
      apiKey: apiKey
    }))
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#2e2e2f] border border-[#faab2a]/20 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-[#faab2a]">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Select AI Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-[#2e2e2f] border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-[#faab2a] focus:outline-none"
            >
              <option value="gpt-4o" className="bg-[#2e2e2f] text-white">GPT-4o</option>
              <option value="gpt-4-turbo" className="bg-[#2e2e2f] text-white">GPT-4 Turbo</option>
              <option value="gemini" className="bg-[#2e2e2f] text-white">Gemini</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="w-full bg-white/10 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-[#faab2a] focus:outline-none"
            />
          </div>

          <div className="text-sm text-gray-400">
            Your API key is stored locally ;D
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md bg-[#faab2a] text-[#2e2e2f] font-medium hover:bg-[#faab2a]/90 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 