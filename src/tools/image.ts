/**
 * Agnes AI Image Generation Tool
 *
 * Generates images using Agnes AI's image generation models.
 * This tool is registered with the DSH agent loop when the plugin is active.
 */

export interface AgnesImageToolConfig {
  apiKey: string
  /** Base URL for Agnes AI API. Use https://api.agnes-ai.cn/v1 for China or https://apihub.agnes-ai.com/v1 for Global */
  baseURL: string
}

export interface AgnesImageGenerationOptions {
  model: string
  prompt: string
  size: '1K' | '2K' | '3K' | '4K'
  ratio?: '1:1' | '3:4' | '4:3' | '16:9' | '9:16' | '2:3' | '3:2' | '21:9'
  image?: string[]
  returnBase64?: boolean
}

export interface AgnesImageGenerationResult {
  success: boolean
  imageUrl?: string
  base64Data?: string
  revisedPrompt?: string
  error?: string
}

/**
 * Generate an image using Agnes AI's API.
 */
export async function generateImage(
  options: AgnesImageGenerationOptions,
  config: AgnesImageToolConfig,
): Promise<AgnesImageGenerationResult> {
  const { model, prompt, size, ratio, image, returnBase64 } = options;

  try {
    const requestBody: Record<string, unknown> = {
      model,
      prompt,
      size,
    };

    if (ratio) {
      requestBody.ratio = ratio;
    }

    if (image && image.length > 0) {
      requestBody.image = image;
    }

    if (returnBase64) {
      requestBody.return_base64 = true;
    }

    const response = await fetch(`${config.baseURL}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
      } catch {
        // Use raw error
      }
      return { success: false, error: errorMessage };
    }

    const data = await response.json();

    if (data.data?.[0]) {
      return {
        success: true,
        imageUrl: data.data[0].url || undefined,
        base64Data: data.data[0].b64_json || undefined,
        revisedPrompt: data.data[0].revised_prompt || undefined,
      };
    }

    return { success: false, error: 'No image data in response' };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}
