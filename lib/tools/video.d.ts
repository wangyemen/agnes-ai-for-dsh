/**
 * Agnes AI Video Generation Tool
 *
 * Generates videos using Agnes AI's video generation models.
 * This tool is registered with the DSH agent loop when the plugin is active.
 */
export interface AgnesVideoToolConfig {
    apiKey: string;
    /** Base URL for Agnes AI API. Use https://api.agnes-ai.cn/v1 for China or https://apihub.agnes-ai.com/v1 for Global */
    baseURL: string;
}
export interface AgnesVideoGenerationOptions {
    model: string;
    prompt: string;
    seconds?: string;
    mode?: 'ti2vid' | 'keyframes' | 'text' | 'reference';
    size?: '480P' | '720P' | '1080P' | '1K' | '2K';
    aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '21:9';
    image?: string;
    numFrames?: number;
    frameRate?: number;
    seed?: number;
    negativePrompt?: string;
}
export interface AgnesVideoTaskResponse {
    success: boolean;
    taskId?: string;
    videoId?: string;
    status?: 'queued' | 'in_progress' | 'completed' | 'failed';
    videoUrl?: string;
    progress?: number;
    error?: string;
}
/**
 * Create a video generation task using Agnes AI's API.
 * Video generation is async - returns a task ID for polling.
 */
export declare function generateVideo(options: AgnesVideoGenerationOptions, config: AgnesVideoToolConfig): Promise<AgnesVideoTaskResponse>;
/**
 * Poll for video generation completion.
 * Returns the final video URL when complete.
 */
export declare function pollVideoStatus(taskId: string, config: AgnesVideoToolConfig, pollIntervalMs?: number, maxAttempts?: number): Promise<AgnesVideoTaskResponse>;
//# sourceMappingURL=video.d.ts.map