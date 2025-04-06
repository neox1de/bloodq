'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { FaUpload, FaTimesCircle } from 'react-icons/fa';

interface FileUploaderProps {
  onImageSelect: (base64: string) => void;
}

export default function FileUploader({ onImageSelect }: FileUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    
    if (acceptedFiles.length === 0) {
      return;
    }

    const file = acceptedFiles[0];
    
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
      onImageSelect(base64);
    };
    
    reader.readAsDataURL(file);
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1
  });


  const clearImage = () => {
    setPreview(null);
    onImageSelect('');
  };

  return (
    <div className="w-full">
      {!preview ? (
        <div {...getRootProps()}>
          <motion.div
            whileHover={{ scale: 1.01, borderColor: '#D3FB18' }}
            whileTap={{ scale: 0.99 }}
            className={`border-2 border-dashed ${
              isDragActive ? 'border-[#D3FB18]' : 'border-gray-300'
            } rounded-lg p-6 text-center cursor-pointer transition-colors`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center">
              <motion.div
                animate={{ 
                  y: isDragActive ? [0, -10, 0] : 0 
                }}
                transition={{ 
                  repeat: isDragActive ? Infinity : 0, 
                  duration: 1 
                }}
              >
                <FaUpload className={`text-4xl mb-4 ${isDragActive ? 'text-highlight' : 'text-gray-400'}`} />
              </motion.div>
              <p className="text-lg mb-2">
                {isDragActive ? 'Drop the image here' : 'Drag & drop your blood test image'}
              </p>
              <p className="text-sm text-text-secondary">or click to select a file</p>
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-lg overflow-hidden"
        >
          <div className="aspect-video bg-gray-900 flex items-center justify-center overflow-hidden">
            <img 
              src={preview} 
              alt="Blood test preview" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <motion.button 
            onClick={clearImage}
            className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded-full hover:bg-black transition-colors duration-200"
            aria-label="Remove image"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaTimesCircle size={20} />
          </motion.button>
        </motion.div>
      )}
      
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 mt-2 text-sm"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}