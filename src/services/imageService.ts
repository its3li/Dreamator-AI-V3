import { ImageSettings, ImageResponse } from '../types';

export const modelOptions = [
  {
    id: 'balanced',
    label: 'Balanced',
    description: 'Best for general purpose image generation with optimal quality and speed balance',
    promptSuffix: ''
  },
  {
    id: 'photorealistic',
    label: 'Photorealistic',
    description: 'Creates highly realistic photographs with exceptional detail and lighting',
    promptSuffix: ', photorealistic, highly detailed, 8k uhd, professional photography, natural lighting, sharp focus, DSLR, RAW photo'
  },
  {
    id: 'anime',
    label: 'Anime Style',
    description: 'Generates anime and manga style artwork with vibrant colors and distinct aesthetics',
    promptSuffix: ', anime style, manga art, cel shaded, Studio Ghibli inspired, clean lines, vibrant colors, 2D illustration'
  },
  {
    id: '3d',
    label: '3D Render',
    description: 'Creates cartoon-style 3D rendered scenes with a playful look',
    promptSuffix: ', 3D cartoon render, Pixar style, stylized 3D, cute, playful, soft lighting, vibrant colors, smooth textures, cartoon shading'
  }
];

const defaultSettings: ImageSettings = {
  model: 'balanced',
  enhance: true,
  seed: -1
};

export class ImageGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageGenerationError';
  }
}

export async function generateImages(
  prompt: string,
  model: string,
  count: number = 2
): Promise<ImageResponse[]> {
  const promises = Array(count).fill(null).map(() => 
    generateImage(prompt, { model })
  );
  return Promise.all(promises);
}

export async function generateImage(
  prompt: string,
  settings: ImageSettings = {},
  keepSeed: boolean = false
): Promise<ImageResponse> {
  if (!prompt?.trim()) {
    throw new ImageGenerationError('Prompt is required');
  }

  try {
    const finalSettings = {
      ...defaultSettings,
      ...settings,
      seed: keepSeed && settings.seed ? settings.seed : Math.floor(Math.random() * 2147483647)
    };

    // Find the selected style and append its prompt suffix
    const selectedStyle = modelOptions.find(option => option.id === finalSettings.model) || modelOptions[0];
    const enhancedPrompt = prompt.trim() + selectedStyle.promptSuffix;

    // Build the URL with parameters
    const params = new URLSearchParams();
    
    if (finalSettings.seed) {
      params.append('seed', finalSettings.seed.toString());
    }
    params.append('enhance', 'true');
    params.append('nologo', 'true');
    params.append('private', 'true');
    params.append('safe', 'false');
    params.append('width', '1024');
    params.append('height', '1024');
    params.append('guidance', '8');
    params.append('steps', '30');

    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const baseUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
    const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;

    // Validate the response
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 500) {
        throw new ImageGenerationError('The image generation service is currently unavailable. Please try again later.');
      }
      throw new ImageGenerationError(`Failed to generate image: ${response.statusText}`);
    }

    // Check if the response is actually an image
    const contentType = response.headers.get('content-type');
    if (!contentType?.startsWith('image/')) {
      throw new ImageGenerationError('Invalid response from the server');
    }

    return {
      url,
      settings: {
        ...finalSettings,
        model: finalSettings.model
      }
    };
  } catch (error) {
    console.error('Error generating image:', error);
    if (error instanceof ImageGenerationError) {
      throw error;
    }
    throw new ImageGenerationError('Failed to generate image. Please try again.');
  }
}

export async function downloadImage(url: string, filename?: string): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    
    const randomString = Math.random().toString(36).substring(2, 15);
    link.download = filename || `dreamator-${randomString}.png`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Failed to download image:', error);
    throw new Error('Failed to download image. Please try right-clicking and "Save Image As" instead.');
  }
}   