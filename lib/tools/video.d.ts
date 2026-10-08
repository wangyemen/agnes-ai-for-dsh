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
    /** 字符串 `"4"`–`"12"`，默认 `"5"` */
    seconds?: string;
    /** `text` | `keyframe` | `reference` */
    mode?: 'text' | 'keyframe' | 'reference';
    /** Flash 仅支持 `720P` */
    size?: '720P' | '1080P' | '1K' | '2K';
    aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '21:9';
    /** `keyframe` 模式首帧 */
    firstFrame?: string;
    /** `keyframe` 模式尾帧 */
    lastFrame?: string;
    /** `reference` 模式参考图片 */
    images?: string[];
    /** `reference` 模式参考音频 */
    audios?: string[];
    seed?: number;
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
 *
 * 官方推荐 `GET /agnesapi?video_id=<VIDEO_ID>&model_name=<MODEL>`：它适用于
 * `text`、`keyframe`、`reference` 全部模式；不带 `model_name` 的纯 `video_id`
 * 查询仅适用于 `mode: "text"`。所以这里总是带上 model。
 */
export declare function pollVideoStatus(videoId: string, config: AgnesVideoToolConfig, model: string, pollIntervalMs?: number, maxAttempts?: number): Promise<AgnesVideoTaskResponse>;
//# sourceMappingURL=video.d.ts.map