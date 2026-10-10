/**
 * Agnes AI API clients.
 *
 * These are plain async functions with no host dependency, so they can be
 * unit-tested and reused. Contracts follow ../API/*.md exactly.
 */
import { type AgnesRegion, type AgnesVideoMode } from './types.js';
export interface AgnesClientConfig {
    apiKey: string;
    baseURL: string;
}
export interface GenerateImageOptions {
    model: string;
    prompt: string;
    /** Tier value such as `1K`..`4K`. */
    size: string;
    ratio?: string;
    /** Input image URLs (or data URIs) for image-to-image / multi-image edit. */
    image?: string[];
    /** Return a base64 data URI instead of a hosted URL. */
    returnBase64?: boolean;
}
export interface GenerateImageResult {
    url?: string;
    base64?: string;
    revisedPrompt?: string;
    error?: string;
}
/**
 * Generate or edit an image.
 *
 * Two documented rules are load-bearing:
 *  - `response_format` must live inside `extra_body`; at the top level it is
 *    explicitly rejected.
 *  - text-to-image uses top-level `return_base64`; image-to-image uses
 *    `extra_body.response_format: "b64_json"`.
 */
export declare function generateImage(options: GenerateImageOptions, config: AgnesClientConfig): Promise<GenerateImageResult>;
export interface GenerateVideoOptions {
    model: string;
    prompt: string;
    /** Duration as a string, `"4"`..`"12"`. */
    seconds?: string;
    mode?: AgnesVideoMode;
    size?: string;
    aspectRatio?: string;
    /** keyframe mode: first frame URL. */
    firstFrame?: string;
    /** keyframe mode: last frame URL. */
    lastFrame?: string;
    /** reference mode: reference image URLs. */
    images?: string[];
    /** reference mode: reference audio URLs. */
    audios?: string[];
    /** Poll interval in ms (default 2000). */
    pollIntervalMs?: number;
    /** Maximum poll attempts (default 90, ≈3 minutes at 2s). */
    maxAttempts?: number;
    /** Progress callback, 0-100. */
    onProgress?: (progress: number, note?: string) => void;
}
export interface GenerateVideoResult {
    url?: string;
    videoId?: string;
    error?: string;
}
/**
 * Create a video task and poll until it settles.
 *
 * Polling always sends `model_name`: the bare `video_id` form is documented as
 * valid only for `mode: "text"`, so including the model is the form that works
 * for every mode.
 */
export declare function generateVideo(options: GenerateVideoOptions, config: AgnesClientConfig): Promise<GenerateVideoResult>;
export declare const IMAGE_SIZE_CHOICES: ("1K" | "2K" | "3K" | "4K")[];
export declare const RATIO_CHOICES: ("1:1" | "3:4" | "4:3" | "16:9" | "9:16" | "2:3" | "3:2" | "21:9")[];
export declare const VIDEO_SIZE_CHOICES: ("1K" | "2K" | "720P" | "1080P")[];
export { type AgnesRegion };
//# sourceMappingURL=api.d.ts.map