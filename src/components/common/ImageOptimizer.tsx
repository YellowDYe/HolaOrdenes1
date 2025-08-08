import React, { useState, useCallback } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';

interface ImageOptimizerProps {
  onImageSelect: (optimizedImageUrl: string) => void;
  onImageRemove: () => void;
  currentImage?: string;
  maxSizeKB?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  acceptedFormats?: string[];
  className?: string;
  disabled?: boolean;
}

const ImageOptimizer: React.FC<ImageOptimizerProps> = ({
  onImageSelect,
  onImageRemove,
  currentImage,
  maxSizeKB = 500,
  maxWidth = 800,
  maxHeight = 600,
  quality = 0.8,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  className = '',
  disabled = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const compressImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to WebP if supported, otherwise JPEG
        const outputFormat = 'image/webp';
        const dataUrl = canvas.toDataURL(outputFormat, quality);
        
        // Check if compressed size is acceptable
        const sizeKB = Math.round((dataUrl.length * 3) / 4 / 1024);
        
        if (sizeKB > maxSizeKB) {
          // Try with lower quality
          const lowerQuality = Math.max(0.1, quality - 0.2);
          const compressedDataUrl = canvas.toDataURL(outputFormat, lowerQuality);
          resolve(compressedDataUrl);
        } else {
          resolve(dataUrl);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }, [maxWidth, maxHeight, quality, maxSizeKB]);

  const handleFileSelect = async (file: File) => {
    setError('');
    setIsProcessing(true);

    try {
      // Validate file type
      if (!acceptedFormats.includes(file.type)) {
        throw new Error(`Formato no soportado. Use: ${acceptedFormats.join(', ')}`);
      }

      // Validate file size (before compression)
      const maxFileSizeKB = maxSizeKB * 4; // Allow larger input files
      if (file.size > maxFileSizeKB * 1024) {
        throw new Error(`El archivo es demasiado grande. Máximo: ${maxFileSizeKB}KB`);
      }

      // Compress and optimize
      const optimizedImageUrl = await compressImage(file);
      onImageSelect(optimizedImageUrl);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al procesar la imagen';
      setError(errorMessage);
      console.error('Image optimization error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (disabled || isProcessing) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, isProcessing]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    setError('');
    onImageRemove();
  };

  return (
    <div className={className}>
      {currentImage ? (
        <div className="relative">
          <div className="relative group">
            <img
              src={currentImage}
              alt="Imagen seleccionada"
              className="w-full h-64 object-cover rounded-2xl border-2 border-gray-200 shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:border-primary-400"
            />
            
            {/* Processing overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center">
                <div className="bg-white rounded-xl p-4 flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                  <span className="text-sm font-medium text-gray-900">Optimizando imagen...</span>
                </div>
              </div>
            )}
            
            {/* Change image overlay */}
            {!isProcessing && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-2xl transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <label className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl px-6 py-4 shadow-xl border border-gray-200 cursor-pointer hover:bg-opacity-100 transition-all">
                    <div className="flex items-center space-x-3">
                      <Upload className="w-4 h-4 text-primary-600" />
                      <span className="text-sm text-gray-800 font-semibold">Cambiar imagen</span>
                    </div>
                    <input
                      type="file"
                      accept={acceptedFormats.join(',')}
                      onChange={handleFileInputChange}
                      className="hidden"
                      disabled={disabled || isProcessing}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
          
          {/* Remove button */}
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled || isProcessing}
            className="absolute -top-4 -right-4 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Eliminar imagen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="relative border-2 border-dashed border-gray-300 rounded-2xl hover:border-primary-400 hover:bg-primary-50 transition-all duration-300 group cursor-pointer"
        >
          <label className="block cursor-pointer p-8">
            <input
              type="file"
              accept={acceptedFormats.join(',')}
              onChange={handleFileInputChange}
              className="hidden"
              disabled={disabled || isProcessing}
            />
            
            <div className="flex flex-col items-center space-y-3">
              <div className="bg-primary-100 group-hover:bg-primary-200 p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 shadow-sm group-hover:shadow-md">
                {isProcessing ? (
                  <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-primary-600 group-hover:text-primary-700 transition-colors duration-300" />
                )}
              </div>
              
              <div className="text-center">
                <p className="text-base font-bold text-gray-900 group-hover:text-primary-700 transition-colors duration-300 mb-2 font-poppins">
                  {isProcessing ? 'Optimizando imagen...' : 'Subir imagen'}
                </p>
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                  Arrastra una imagen aquí o haz clic para seleccionar
                </p>
                <div className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 group-hover:border-primary-400 group-hover:text-primary-700 group-hover:bg-primary-50 transition-all duration-300 shadow-sm group-hover:shadow-md">
                  <span>Seleccionar archivo</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Máximo {maxSizeKB}KB • Se optimizará automáticamente
                </p>
              </div>
            </div>
          </label>
        </div>
      )}
      
      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};

export default ImageOptimizer;