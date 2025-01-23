import { motion } from 'framer-motion';
import { Download, Share2, Trash2, ArrowUpRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ImageData } from '../types';
import { getStoredImages, removeImage } from '../utils/storage';
import { useNavigate } from 'react-router-dom';

export function GalleryPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadedImages = getStoredImages();
    setImages(loadedImages);
  }, []);

  const handleDownload = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'generated-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleShare = async (url: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out my AI-generated image!',
          text: 'Created with Dreamator',
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        // You might want to show a toast notification here
      }
    } catch (error) {
      console.error('Error sharing image:', error);
    }
  };

  const handleDelete = (index: number) => {
    removeImage(index);
    const updatedImages = getStoredImages();
    setImages(updatedImages);
  };

  return (
    <div className="container mx-auto px-4 min-h-[80vh] relative">
      {/* Gallery Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12"
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
          Your Gallery
        </h1>
        <p className="text-lg text-purple-300/50">Where your AI-generated masterpieces come to life</p>
      </motion.div>

      {images.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center min-h-[80vh] relative"
        >
          <div className="text-center mt-32">
            <h2 className="text-2xl font-medium text-white/90 mb-4">Your gallery is empty</h2>
            <p className="text-purple-300/50 text-center max-w-md mb-8">
              Start creating amazing AI-generated images to fill your gallery with masterpieces
            </p>
            <button
              onClick={() => navigate('/')}
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-white/90 transition-all duration-300"
            >
              <span>Create Your First Image</span>
              <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group bg-purple-darker rounded-xl overflow-hidden aspect-square"
              style={{ 
                width: '100%',
                maxWidth: '600px',
                margin: '0 auto'
              }}
            >
              <div className="aspect-square overflow-hidden rounded-2xl glass-morphism">
                <img
                  src={image.url}
                  alt={`Generated image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDownload(image.url)}
                      className="w-8 h-8 rounded-lg bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors duration-200"
                      title="Download image"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleShare(image.url)}
                      className="w-8 h-8 rounded-lg bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors duration-200"
                      title="Share image"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="w-8 h-8 rounded-lg bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors duration-200"
                      title="Delete image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
