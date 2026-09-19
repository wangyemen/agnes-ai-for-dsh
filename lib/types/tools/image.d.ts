/**
 * Agnes AI Tool: Image Generation
 *
 * Provides image generation capabilities using agnes-image-2.1-flash
 */
export interface AgnesImageToolConfig {
    /** API key environment variable name */
    apiKeyEnv: string;
    /** Base URL for the API */
    baseURL: string;
}
export interface AgnesImageGenerationOptions {
    /** The text prompt to generate an image from */
    prompt: string;
    /** Output size档位: 1K, 2K, 3K, 4K */
    size: string;
    /** Aspect ratio: 1:1, 3:4, 4:3, 16:9, 9:16, 2:3, 3:2, 21:9 */
    ratio?: string;
    /** Input image(s) for image-to-image or multi-image synthesis */
    image?: string[];
    /** Return base64 instead of URL */
    returnBase64?: boolean;
}
export interface AgnesImageGenerationResult {
    /** Generated image URL */
    url: string | null;
    /** Base64 encoded image */
    b64_json: string | null;
    /** Revised prompt used by the model */
    revised_prompt: string | null;
}
