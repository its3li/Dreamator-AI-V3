export interface ImageSettings {
  model?: string;
  seed?: number;
  enhance?: boolean;
}

export interface ImageData {
  url: string;
  prompt: string;
  editPrompt: string;
  isEditing: boolean;
  isLoading: boolean;
  settings: {
    seed: number;
    model: string;
  }
}

export interface ImageResponse {
  url: string;
  settings: ImageSettings;
}
