/**
 * Agnes AI Image Generation Tool
 *
 * Generates images using Agnes AI's image generation models.
 * This tool is registered with the DSH agent loop when the plugin is active.
 */
export interface AgnesImageToolConfig {
    apiKey: string;
    baseURL: string;
}
export interface AgnesImageGenerationOptions {
    model: string;
    prompt: string;
    size: '1K' | '2K' | '3K' | '4K';
    ratio?: '1:1' | '3:4' | '4:3' | '16:9' | '9:16' | '2:3' | '3:2' | '21:9';
    image?: string[];
    returnBase64?: boolean;
}
export interface AgnesImageGenerationResult {
    success: boolean;
    imageUrl?: string;
    base64Data?: string;
    revisedPrompt?: string;
    error?: string;
}
/**
 * Generate an image using Agnes AI's API.
 */
export declare function generateImage(options: AgnesImageGenerationOptions, config: AgnesImageToolConfig): Promise<AgnesImageGenerationResult>;
//# sourceMappingURL=image.d.ts.map