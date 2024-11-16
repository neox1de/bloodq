'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaGithub } from 'react-icons/fa'
import { CgWebsite } from 'react-icons/cg'
import SettingsModal from '@/components/SettingsModal'
import { generateInsights } from '@/utils/llm'
import ReactMarkdown from 'react-markdown'

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('Gemini default key available:', !!process.env.NEXT_PUBLIC_GEMINI_KEY)
    
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!selectedImage) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const insights = await generateInsights(selectedImage, description)
      setResult(insights)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze results')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#2e2e2f] text-white">
      {/* Header with github and website icon and links */}
      <header className="p-4 flex justify-end">
        <div className="flex gap-4">
          <Link
            href="https://github.com/neox1de"
            target="_blank"
            className="text-[#faab2a] hover:text-[#faab2a]/80 transition-colors"
          >
            <FaGithub size={24} />
          </Link>
          <Link
            href="https://neox1de.com"
            target="_blank"
            className="text-[#faab2a] hover:text-[#faab2a]/80 transition-colors"
          >
            <CgWebsite size={24} />
          </Link>
        </div>
      </header>

      {/* Bloodq main content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            <span className="text-[#faab2a]">Blood</span>q
          </h1>
          <p className="text-xl mb-8 text-gray-300">
            Analyze your blood test results into clear, actionable insights with AI.
          </p>
          
          <div className="bg-white/5 p-8 rounded-lg backdrop-blur-sm">
            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <label 
                  className="block text-[#faab2a] text-sm font-medium mb-2"
                  htmlFor="file-upload"
                >
                  Upload Blood Test Image
                </label>
                <div className="flex flex-col items-center justify-center">
                  <label 
                    htmlFor="file-upload"
                    className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#faab2a] transition-colors relative"
                  >
                    {previewUrl ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-full max-w-full object-contain rounded-lg"
                        />
                      </div>
                    ) : (
                      <>
                        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="text-sm text-gray-400">Click to upload or drag and drop</span>
                        <span className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 10MB</span>
                      </>
                    )}
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              {/* Additional Description */}
              <div>
                <label 
                  className="block text-[#faab2a] text-sm font-medium mb-2"
                  htmlFor="description"
                >
                  Additional Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-24 p-3 rounded bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-[#faab2a] focus:outline-none"
                  placeholder="Add any additional information or specific concerns..."
                />
              </div>
            </div>
            
            <div className="mt-6">
              <button 
                onClick={handleSubmit}
                disabled={!selectedImage || isLoading}
                className="bg-[#faab2a] text-[#2e2e2f] px-8 py-3 rounded-lg font-medium hover:bg-[#faab2a]/90 transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Analyzing...' : 'Start Analyzing'}
              </button>
            </div>
          </div>

          {/* Display analyze error if there is any */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* Display results as Markdown format since ai model outputs markdown. */}
          {result && (
            <div className="mt-8 p-6 bg-white/5 rounded-lg text-left">
              <ReactMarkdown // https://github.com/remarkjs/react-markdown
                className="prose prose-invert prose-orange max-w-none"
                components={{

                  h1: ({...props}) => <h1 {...props} className="text-2xl font-bold text-[#faab2a] mb-4" />,
                  h2: ({...props}) => <h2 {...props} className="text-xl font-bold text-[#faab2a] mb-3" />,
                  h3: ({...props}) => <h3 {...props} className="text-lg font-bold text-[#faab2a] mb-2" />,
                  
                  ul: ({...props}) => <ul {...props} className="list-disc list-inside mb-4 space-y-1" />,
                  ol: ({...props}) => <ol {...props} className="list-decimal list-inside mb-4 space-y-1" />,
                  
                  p: ({...props}) => <p {...props} className="mb-4" />,
                  
                  a: ({...props}) => (
                    <a 
                      {...props} 
                      className="text-[#faab2a] hover:text-[#faab2a]/80 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                  
                  code: ({className, children, ...props}: React.ComponentPropsWithoutRef<'code'>) => (
                    <code
                      {...props}
                      className={`${
                        !className
                          ? 'bg-white/10 rounded px-1 py-0.5'
                          : 'block bg-white/10 rounded-lg p-4 overflow-x-auto'
                      }`}
                    >
                      {children}
                    </code>
                  ),
                  

                  blockquote: ({...props}) => (
                    <blockquote
                      {...props}
                      className="border-l-4 border-[#faab2a] pl-4 italic my-4"
                    />
                  ),
                  

                  table: ({...props}) => (
                    <div className="overflow-x-auto mb-4">
                      <table {...props} className="min-w-full divide-y divide-gray-600" />
                    </div>
                  ),
                  thead: ({...props}) => <thead {...props} className="bg-white/5" />,
                  th: ({...props}) => (
                    <th {...props} className="px-4 py-2 text-left text-[#faab2a]" />
                  ),
                  td: ({...props}) => <td {...props} className="px-4 py-2" />,
                }}
              >
                {result}
              </ReactMarkdown>
            </div>
          )}

          {/* Settings button */}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="fixed bottom-4 left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Settings"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-[#faab2a]" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Settings Modal visibility */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </main>
  )
}
