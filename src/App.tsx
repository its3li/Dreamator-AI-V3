import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageGenerator } from './components/ImageGenerator';
import { ImageResults } from './components/ImageResults';
import { GalleryPage } from './pages/GalleryPage';
import { ImageData } from './types';
import { generateImages, downloadImage as downloadImageService, generateImage } from './services/imageService';
import { saveImages, getStoredImages } from './utils/storage';
import { Routes, Route, Link, useLocation } from 'react-router-dom';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'gallery'>('home');
  const [generatedImages, setGeneratedImages] = useState<ImageData[]>([]);
  const [galleryImages, setGalleryImages] = useState<ImageData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState('');

  // Load gallery images on mount
  useEffect(() => {
    setGalleryImages(getStoredImages());
  }, []);

  const handleGenerate = async (prompt: string, model: string) => {
    try {
      setIsGenerating(true);
      setMessage('');
      
      const newImages = await generateImages(prompt, model, 2);
      
      // Create image data with the original prompt
      const imageDataArray = newImages.map(img => ({
        url: img.url,
        prompt: prompt, // Store the original prompt here
        isEditing: false,
        isLoading: false,
        settings: img.settings
      }));
      
      // Update displayed images
      setGeneratedImages(imageDataArray);
      
      // Save to gallery
      const updatedGallery = [...imageDataArray, ...galleryImages];
      setGalleryImages(updatedGallery);
      saveImages(updatedGallery);
      
      setMessage('Images generated successfully!');
    } catch (error) {
      setMessage('Error generating images. Please try again.');
      console.error('Error generating images:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      await downloadImageService(imageUrl, `dreamator-${index + 1}`);
      setMessage('Image downloaded successfully!');
    } catch (error) {
      setMessage('Error downloading image. Please try again.');
      console.error('Error downloading image:', error);
    }
  };

  const handleShare = async (imageUrl: string) => {
    try {
      await navigator.share({
        title: 'Check out this AI-generated image!',
        text: 'Created with Dreamator AI',
        url: imageUrl,
      });
    } catch (error) {
      console.error('Error sharing image:', error);
    }
  };

  const handleEdit = async (index: number, editPrompt: string) => {
    if (!editPrompt.trim()) return;

    try {
      const updatedImages = [...generatedImages];
      updatedImages[index].isLoading = true;
      setGeneratedImages(updatedImages);

      const originalImage = generatedImages[index];
      // Get the original prompt and merge with edit prompt
      const basePrompt = originalImage.prompt;
      const combinedPrompt = `${basePrompt}, ${editPrompt}`;
      
      const result = await generateImage(combinedPrompt, {
        model: originalImage.settings.model,
        seed: originalImage.settings.seed
      }, true);

      updatedImages[index] = {
        ...originalImage,
        url: result.url,
        prompt: combinedPrompt, // Store the combined prompt as the new prompt
        isEditing: false,
        isLoading: false
      };

      setGeneratedImages(updatedImages);
      
      // Update gallery
      const updatedGallery = [...galleryImages];
      const galleryIndex = galleryImages.findIndex(img => 
        img.settings.seed === originalImage.settings.seed
      );
      if (galleryIndex !== -1) {
        updatedGallery[galleryIndex] = updatedImages[index];
        setGalleryImages(updatedGallery);
        saveImages(updatedGallery);
      }

    } catch (error) {
      const updatedImages = [...generatedImages];
      updatedImages[index].isLoading = false;
      setGeneratedImages(updatedImages);
      
      console.error('Error editing image:', error);
      setMessage('Failed to edit image. Please try again.');
    }
  };

  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#0D0118] text-white relative overflow-hidden flex flex-col">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Top-left gradient blob */}
        <div 
          className="absolute -top-1/4 -left-1/4 w-[80%] h-[80%] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(147,51,234,0.15) 0%, rgba(147,51,234,0.05) 50%, rgba(147,51,234,0) 70%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Bottom-right gradient blob */}
        <div 
          className="absolute -bottom-1/4 -right-1/4 w-[80%] h-[80%] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(168,85,247,0.05) 50%, rgba(168,85,247,0) 70%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Center accent blob */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(126,34,206,0.07) 0%, rgba(126,34,206,0.02) 50%, rgba(126,34,206,0) 70%)',
            filter: 'blur(45px)',
          }}
        />
      </div>

      <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-4">
        <div className="container mx-auto">
          <div className="flex justify-center gap-2 bg-[#1A1225] rounded-full w-fit mx-auto px-1 py-1">
            <Link
              to="/"
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                location.pathname === '/' ? 'bg-purple-600/20 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              to="/gallery"
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                location.pathname === '/gallery' ? 'bg-purple-600/20 text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              Gallery
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow container mx-auto px-4 pt-24 pb-24">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-4xl mx-auto"
              >
                <div className="text-center mb-12">
                  <h1 className="mb-4 flex flex-wrap items-center justify-center gap-2 leading-loose min-h-[100px]">
                    <span 
                      className="text-[2.2rem] sm:text-[2.8rem] md:text-[3.4rem] bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200 py-4" 
                      style={{ 
                        fontFamily: 'Rockybilly', 
                        lineHeight: '2',
                        paddingTop: '32px',
                        paddingBottom: '1px'
                      }}
                    >
                      Dreamator
                    </span>
                    <span className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-900 via-purple-800 to-purple-600">AI</span>
                  </h1>
                  <div className="flex flex-col gap-2 text-center mb-8 px-4 sm:px-0">
                    <p className="text-lg text-white/90">Transform your imagination into reality</p>
                    <p className="text-lg text-white/90" style={{ direction: 'rtl' }}>حوّل خيالك إلى واقع</p>
                  </div>
                </div>
                <ImageGenerator onGenerate={handleGenerate} isGenerating={isGenerating} message={message} />
                <ImageResults 
                  images={generatedImages}
                  onImageClick={() => {}}
                  onEditImage={handleEdit}
                  downloadImage={handleDownload}
                  shareImage={handleShare}
                />
              </motion.div>
            } />
            <Route path="/gallery" element={
              <motion.div
                key="gallery"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <GalleryPage images={galleryImages} />
              </motion.div>
            } />
          </Routes>
        </AnimatePresence>
      </main>

      <footer className="mt-auto py-8 text-center text-purple-300/30 text-sm">
        <p className="mb-2">Built with ❤ by Ali Mahmoud using <span className="font-semibold">React</span>, <span className="font-semibold">Vite</span>, <span className="font-semibold">Tailwind CSS</span>, and <span className="font-semibold">Pollinations API</span>.</p>
        <p>All rights reserved • {new Date().getFullYear()} </p>
      </footer>
    </div>
  );
}

export default App;