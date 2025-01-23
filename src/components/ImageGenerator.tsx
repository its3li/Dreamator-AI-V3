import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, Settings } from 'lucide-react';
import { useState } from 'react';

interface ImageGeneratorProps {
  onGenerate: (prompt: string, model: string) => Promise<void>;
  isGenerating: boolean;
  message: string;
}

export function ImageGenerator({ onGenerate, isGenerating, message }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedModel, setSelectedModel] = useState('photorealistic');

  const modelOptions = [
    {
      id: 'photorealistic',
      label: 'Photorealistic',
      description: 'Create stunning, lifelike images with incredible detail'
    },
    {
      id: 'anime',
      label: 'Anime Style',
      description: 'Generate beautiful anime and manga-style illustrations'
    },
    {
      id: '3d',
      label: '3D Render',
      description: 'Create 3D rendered scenes with depth and dimension'
    }
  ];

  const onPromptChange = (value: string) => {
    setPrompt(value);
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    onGenerate(prompt, selectedModel);
  };

  const isArabic = (text: string) => /[\u0600-\u06FF]/.test(text);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      <div className="relative glass-morphism rounded-3xl overflow-hidden p-8 backdrop-blur-sm bg-black/10">
        <div className="relative">
          {/* Settings Button */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="absolute -right-2 -top-2 w-10 h-10 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 flex items-center justify-center transition-all duration-300 z-10"
          >
            <Settings className="w-5 h-5 text-purple-300/70 hover:text-purple-300 transition-colors" />
          </button>

          {/* Input Area */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-900/30">
            <Sparkles className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-300/70" />
            <textarea
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                // Prevent new line in textarea when pressing Enter
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  // Only generate if not already generating and prompt is not empty
                  if (!isGenerating && prompt.trim()) {
                    handleGenerate();
                  }
                }
              }}
              placeholder="Describe your image..."
              className="w-full bg-transparent text-white/90 placeholder-purple-300/50 py-4 px-12 focus:outline-none min-h-[120px] resize-none"
              style={{
                direction: isArabic(prompt) ? 'rtl' : 'ltr'
              }}
              disabled={isGenerating}
            />
          </div>
        </div>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mt-4"
            >
              <div className="space-y-3">
                {modelOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedModel(option.id)}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                      selectedModel === option.id 
                        ? 'bg-purple-600/20 border border-purple-300/20' 
                        : 'bg-gray-900/30 hover:bg-purple-600/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white/90">{option.label}</span>
                      {selectedModel === option.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-purple-400/50"
                        />
                      )}
                    </div>
                    <p className="text-sm text-purple-300/50 mt-1">
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full mt-4 py-4 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-white/90 font-medium flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 text-purple-300/70" />
              <span>Generate Images</span>
            </>
          )}
        </button>

        {message && (
          <div className={`mt-4 text-sm ${
            message.includes('Error') ? 'text-red-400' : 'text-green-400'
          }`}>
            {message}
          </div>
        )}
      </div>
    </motion.div>
  );
}