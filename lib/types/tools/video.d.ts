/**
 * Agnes AI Tool: Video Generation
 *
 * Provides video generation capabilities using agnes-video-v2.0
 */
export interface AgnesVideoToolConfig {
    /** API key environment variable name */
    apiKeyEnv: string;
    /** Base URL for the API */
    baseURL: string;
}
export interface AgnesVideoGenerationOptions {
    /** The text prompt describing the video */
    prompt: string;
    /** Input image URL for image-to-video */
    image?: string;
    /** Generation mode: 'ti2vid' or 'keyframes' */
    mode?: string;
    /** Video height (default: 768) */
    height?: number;
    /** Video width (default: 1152) */
    width?: number;
    /** Number of frames (must follow 8n+1 rule, max 441) */
    numFrames?: number;
    /** Frame rate (1-60) */
    frameRate?: number;
    /** Negative prompt */
    negativePrompt?: string;
    /** Random seed for reproducibility */
    seed?: number;
    /** Keyframe images for keyframe animation */
    keyframeImages?: string[];
}
export interface AgnesVideoTask {
    /** Task ID */
    task_id: string;
    /** Video ID */
    video_id: string;
    /** Task status: queued, in_progress, completed, failed */
    status: string;
    /** Progress percentage */
    progress: number;
    /** Video duration in seconds */
    seconds: string;
    /** Video resolution */
    size: string;
}
export interface AgnesVideoResult {
    /** Final video URL */
    url: string;
    /** Task metadata */
    metadata: {
        size_mapping: {
            adjusted: boolean;
            height: number;
            width: number;
            ratio: string;
            resolution: string;
        };
        url: string;
    };
}
