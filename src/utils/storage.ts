import { ImageData } from '../types';

const STORAGE_KEY = 'dreamator_images';

export function saveImages(images: ImageData[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
  } catch (error) {
    console.error('Error saving images:', error);
  }
}

export function getStoredImages(): ImageData[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading images:', error);
    return [];
  }
}

export const removeImage = (index: number) => {
  const currentImages = getStoredImages();
  currentImages.splice(index, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentImages));
};
