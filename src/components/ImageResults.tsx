import { motion } from 'framer-motion';
import { Download, Wand2, X, Share2 } from 'lucide-react';
import { ImageData } from '../types';
import { useState } from 'react';

interface ImageResultsProps {
  images: ImageData[];
  onImageClick: (index: number) => void;
  onEditImage: (index: number, editPrompt: string) => void;
  downloadImage: (image: string, index: number) => void;
  shareImage: (image: string) => void;
}

export function ImageResults({ images, onImageClick, onEditImage, downloadImage, shareImage }: ImageResultsProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editPrompt, setEditPrompt] = useState('');

  const handleEditSubmit = (index: number) => {
    if (!editPrompt.trim()) return;
    onEditImage(index, editPrompt);
    setEditPrompt('');
    setEditingIndex(null);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="mt-8"
    >
      {images.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto px-4 sm:px-0"
        >
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: index * 0.1
              }}
              className="relative group bg-purple-darker rounded-xl overflow-hidden aspect-square"
              style={{ 
                width: '100%',
                maxWidth: '512px',
                margin: '0 auto'
              }}
            >
              <div className="aspect-square overflow-hidden rounded-2xl glass-morphism relative">
                <img
                  src={image.url}
                  alt={`Generated image ${index + 1}`}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${image.isLoading ? 'opacity-50' : 'opacity-100'}`}
                />
                {image.isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                      <div className="mt-4 text-white text-sm">editing...</div>
                    </div>
                  </div>
                )}
                {/* Buttons Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex gap-3">
                    <button
                      onClick={() => downloadImage(image.url, index)}
                      className="w-8 h-8 rounded-lg bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors duration-200"
                      title="Download image"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => shareImage(image.url)}
                      className="w-8 h-8 rounded-lg bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors duration-200"
                      title="Share image"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingIndex(index)}
                      className="w-8 h-8 rounded-lg bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors duration-200"
                      title="Edit image"
                    >
                      <Wand2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Edit Panel */}
              {editingIndex === index && (
                <div className="absolute inset-0 bg-gradient-to-b from-[#1a0b2e]/98 to-[#1a0b2e]/95 backdrop-blur-md rounded-2xl p-6 border border-purple-500/30 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-medium text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">Edit Image</h3>
                    <button
                      onClick={() => {
                        setEditingIndex(null);
                        setEditPrompt('');
                      }}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-300"
                    >
                      <X className="w-5 h-5 text-white/80" />
                    </button>
                  </div>

                  <div className="space-y-5">
                    <input
                      type="text"
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="What Do You want To edit?"
                      className="w-full bg-[#2a1052]/40 border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/40 focus:border-purple-500/50 transition-all duration-300"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && editPrompt.trim()) {
                          handleEditSubmit(index);
                        }
                      }}
                    />

                    <button
                      onClick={() => handleEditSubmit(index)}
                      disabled={!editPrompt.trim() || image.isLoading}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-700 to-purple-900 hover:from-purple-600 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-purple-900/30"
                    >
                      <Wand2 className="w-5 h-5" />
                      <span className="font-medium">edit Image</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
